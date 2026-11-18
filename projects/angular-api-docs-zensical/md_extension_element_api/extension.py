"""Render API placeholders in HTML after Markdown restores raw tags."""

from html import escape
from html.parser import HTMLParser
from pathlib import Path

from markdown.extensions import Extension
from markdown.extensions.toc import nest_toc_tokens
from markdown.postprocessors import Postprocessor
from pymdownx.superfences import SuperFencesBlockPreprocessor
from zensical.extensions.context import ContextPreprocessor

from siemens_angular_api_docs_zensical.settings import load_settings

from .adapter import ApiRenderError
from .renderer import load_renderer


_TAGS = {'si-docs-api': 'api', 'si-docs-types': 'types', 'si-docs-type': 'type'}
_LITERAL = frozenset(('pre', 'code', 'textarea', 'si-docs-component'))
_SELECTORS = ('name', 'component', 'directive', 'injectable', 'pipe', 'service',
              'class', 'interface', 'function', 'enum', 'type')


class _ApiPlaceholders(HTMLParser):
  def __init__(self, source):
    super().__init__(convert_charrefs=False)
    self.source = source
    self.line_offsets = [0]
    for line in source.split('\n')[:-1]:
      self.line_offsets.append(self.line_offsets[-1] + len(line) + 1)
    self.requests = []
    self.ids = set()
    self.stack = []
    self.literal = []
    self.feed(source)
    self.close()
    if self.stack:
      raise ApiRenderError(f'Unclosed <si-docs-{self.stack[-1]["mode"]}> tag; add a matching closing tag')

  def _offset(self):
    line, column = self.getpos()
    return self.line_offsets[line - 1] + column

  def handle_starttag(self, tag, attrs):
    # HTMLParser includes the slash in an unquoted value (name=Widget/>).
    # Preserve the XML-style shorthand supported by the docs tags.
    raw = self.get_starttag_text()
    self_closing = (tag in _TAGS or tag == 'si-docs-component') and raw.endswith('/>')
    if self_closing and tag in _TAGS and attrs and attrs[-1][1] is not None:
      key, value = attrs[-1]
      attrs[-1] = (key, value.removesuffix('/'))
    self._start(tag, attrs, self_closing)

  def handle_startendtag(self, tag, attrs):
    self._start(tag, attrs, True)

  def _start(self, tag, attrs, self_closing):
    self.ids.update(value for key, value in attrs if key == 'id' and value)
    if tag in _LITERAL and not self_closing:
      self.literal.append(tag)
    if self.literal or tag not in _TAGS:
      return

    start = self._offset()
    end = start + len(self.get_starttag_text())
    self._check_content(start)
    mode = _TAGS[tag]
    if self.stack and (self.stack[-1]['mode'] != 'types' or mode != 'type'):
      raise ApiRenderError('<si-docs-types> is the only API tag that can contain nested tags, and accepts only <si-docs-type>')
    attributes = {}
    for key, value in attrs:
      if key in attributes or value is None:
        raise ApiRenderError(f'Invalid API tag attribute {key!r}: use a single attribute with a value')
      attributes[key] = value
    request = {'mode': mode, 'start': start, 'opening_end': end, 'cursor': end}
    if mode == 'types':
      if attributes:
        raise ApiRenderError('<si-docs-types> does not accept attributes')
    else:
      names = [attributes[key] for key in _SELECTORS if key in attributes]
      if len(names) != 1 or not names[0].strip():
        raise ApiRenderError(f'<{tag}> needs exactly one name/component/directive/injectable selector and optional package')
      no_heading = attributes.get('noheading', 'false').lower()
      if no_heading not in ('true', 'false'):
        raise ApiRenderError('API tag noHeading must be "true" or "false"')
      request.update(name=names[0], package=attributes.get('importpath') or attributes.get('package'),
                     heading=attributes.get('heading'), no_heading=no_heading == 'true',
                     hide_implicitly_public=attributes.get('hideimplicitlypublic', '').lower() == 'true')
    self.requests.append(request)
    if self_closing:
      request['end'] = end
      if self.stack:
        self.stack[-1]['cursor'] = end
    else:
      self.stack.append(request)

  def handle_endtag(self, tag):
    if self.literal:
      for index in range(len(self.literal) - 1, -1, -1):
        if tag == self.literal[index]:
          del self.literal[index:]
          break
      return
    if tag not in _TAGS:
      return

    start = self._offset()
    end = self.source.index('>', start) + 1
    if (not self.stack or self.stack[-1]['mode'] != _TAGS[tag] or
        self.source[start + 2:end - 1].strip().lower() != tag):
      raise ApiRenderError(f'Mismatched closing API tag {self.source[start:end]!r}')
    self._check_content(start)
    request = self.stack.pop()
    request['end'] = end
    if request['mode'] == 'types':
      # Keep child embeds where they appeared, then append the related types.
      request['closing_start'] = start
    if self.stack:
      self.stack[-1]['cursor'] = end

  def _check_content(self, end):
    if not self.stack or not self.source[self.stack[-1]['cursor']:end].strip():
      return
    mode = self.stack[-1]['mode']
    if mode == 'types':
      raise ApiRenderError('<si-docs-types> supports only nested <si-docs-type> tags, not authored content')
    raise ApiRenderError(f'<si-docs-{mode}> must be empty; place authored documentation outside the API tag')

  def replace(self, rendered):
    replacements = []
    for request, html in zip(self.requests, rendered):
      if 'closing_start' in request:
        replacements.append((request['start'], request['opening_end'], ''))
      replacements.append((request.get('closing_start', request['start']), request['end'], html))
    output = []
    cursor = 0
    for start, end, html in sorted(replacements):
      output.extend((self.source[cursor:start], html))
      cursor = end
    output.append(self.source[cursor:])
    return ''.join(output)


class ElementApiExtension(Extension):
  def __init__(self, artifact_path=None, enabled=None):
    super().__init__()
    self.artifact_path = Path(artifact_path) if artifact_path is not None else None
    self.enabled = enabled

  def extendMarkdown(self, md):
    if self.enabled is not False:
      # Treat placeholders like other block HTML, not paragraphs of inline HTML.
      md.block_level_elements.extend(_TAGS)
      md.ESCAPED_CHARS.append('<')
      # Run after Python-Markdown's raw_html (30) and amp_substitute (20).
      md.postprocessors.register(ElementApiPostprocessor(md, self), 'element_api', 15)


class _ApiToc(HTMLParser):
  """Merge late-rendered API section headings into the Markdown TOC in page order."""

  def __init__(self, tokens):
    super().__init__()
    self.original = {}
    self.tokens = []

    def collect(items):
      for item in items:
        self.original[item['id']] = {**item, 'children': []}
        collect(item['children'])

    collect(tokens)

  def handle_starttag(self, tag, attrs):
    if tag not in ('h1', 'h2', 'h3', 'h4', 'h5', 'h6'):
      return
    attributes = dict(attrs)
    original = self.original.get(attributes.get('id'))
    if original is not None:
      self.tokens.append(original)
    elif attributes.get('data-api-toc-label') and (target := attributes.get('data-api-toc-target') or attributes.get('id')):
      label = attributes['data-api-toc-label']
      self.tokens.append({'id': target, 'level': int(tag[1]), 'name': label,
                          'html': escape(label), 'data-toc-label': '', 'children': []})


class ElementApiPostprocessor(Postprocessor):
  def __init__(self, md, extension):
    super().__init__(md)
    self.extension = extension

  def _highlight(self, code, language):
    # Generate a code block with the same options and line-anchor counter as
    # authored fences, without feeding generated text back through Markdown.
    language = language or ''
    if not all(char.isalnum() or char in '#.+_-' for char in language):
      return None
    fences = self.md.preprocessors['fenced_code_block']
    return fences.highlight(src=code, language=language, options={}, classes=[], id_value='', attrs={})

  def run(self, html):
    context = ContextPreprocessor.from_markdown(self.md)
    try:
      settings = load_settings(context.config if context else {})
      enabled = self.extension.enabled
      if enabled is None:
        enabled = settings.enabled
      if not enabled:
        return html
      placeholders = _ApiPlaceholders(html)
      if not placeholders.requests:
        return html
      if context is None:
        raise ApiRenderError('Native API rendering requires rendering_context')
      artifact = self.extension.artifact_path or settings.artifact_path
      renderer = load_renderer(settings.root_dir / artifact)
      fences = self.md.preprocessors['fenced_code_block'] if 'fenced_code_block' in self.md.preprocessors else None
      rendered = placeholders.replace(renderer.prepare_page(
        placeholders.requests, Path(context.page.path).as_posix(), placeholders.ids,
        highlight_example=self._highlight if isinstance(fences, SuperFencesBlockPreprocessor) else None,
      ))
      if 'data-api-toc-label=' in rendered and hasattr(self.md, 'toc_tokens'):
        toc = _ApiToc(self.md.toc_tokens)
        toc.feed(rendered)
        toc.close()
        self.md.toc_tokens = nest_toc_tokens(toc.tokens)
      return rendered
    except ApiRenderError as error:
      page = context.page.path if context else 'API documentation page'
      raise ApiRenderError(f'{page}: {error}') from error


def makeExtension(artifact_path=None, enabled=None, *, artifact=None):
  return ElementApiExtension(artifact if artifact is not None else artifact_path, enabled)
