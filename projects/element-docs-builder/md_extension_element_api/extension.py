"""Markdown placeholders run after Composer (31), before HTML/fence stashing."""

import json
from pathlib import Path
import re
from functools import lru_cache
from html.parser import HTMLParser

from markdown.extensions import Extension
from markdown.preprocessors import Preprocessor

from .adapter import ApiRenderError
from .renderer import ApiRenderer


_TAG = re.compile(r'<(?P<closing>/)?si-docs-(?P<kind>api|types|type)\b(?P<attrs>(?:[^>\"\']|\"[^\"]*\"|\'[^\']*\')*)>', re.IGNORECASE)


@lru_cache(maxsize=1)
def _load_renderer(path, modified, size, inode, revision):
  # Native Markdown adapters may create an extension per page. Share the
  # immutable prepared data; each render deep-copies only its selected views.
  return ApiRenderer(json.loads(Path(path).read_text(encoding='utf-8')))


def literal_mask(source):
  """Keep offsets intact while excluding Markdown code and live-preview HTML."""
  mask = list(source)

  def hide(start, end):
    mask[start:end] = ['\n' if char == '\n' else ' ' for char in source[start:end]]

  fence = None
  offset = 0
  for line in source.splitlines(keepends=True):
    candidate = re.sub(r'^(?: {0,3}>[ \t]?)+', '', line)
    opening = re.match(r'^ {0,3}(`{3,}|~{3,})(.*)$', candidate)
    if fence:
      hide(offset, offset + len(line))
      if re.match(r'^ {0,3}' + re.escape(fence[0]) + '{' + str(fence[1]) + r',}[ \t]*$', candidate.rstrip('\n')):
        fence = None
    elif opening and (opening[1][0] != '`' or '`' not in opening[2]):
      fence = (opening[1][0], len(opening[1]))
      hide(offset, offset + len(line))
    elif candidate.startswith(('    ', '\t')):
      hide(offset, offset + len(line))
    offset += len(line)
  # Equal-length backtick delimiters, including spans crossing line boundaries.
  visible = ''.join(mask)
  runs = list(re.finditer(r'`+', visible))
  index = 0
  while index < len(runs):
    opening = runs[index]
    closing_index = next((item for item in range(index + 1, len(runs)) if len(runs[item][0]) == len(opening[0])), None)
    if closing_index is not None:
      hide(opening.start(), runs[closing_index].end())
      index = closing_index + 1
    else:
      index += 1
  for match in re.finditer(r'<!--.*?-->|<si-docs-component\b[^>]*>.*?</si-docs-component\s*>', source, re.DOTALL | re.IGNORECASE):
    hide(match.start(), match.end())
  for match in re.finditer(r'(?<!\\)(?:\\\\)*\\(<)', source):
    hide(match.start(1), match.end(1))
  return ''.join(mask)


class _Attributes(HTMLParser):
  def __init__(self, source):
    super().__init__(convert_charrefs=True)
    self.attributes = {}
    self.feed(source)

  def handle_starttag(self, tag, attrs):
    for key, value in attrs:
      if key in self.attributes or value is None:
        raise ApiRenderError(f'Invalid API tag attribute {key!r}: use a single attribute with a value')
      self.attributes[key] = value

  handle_startendtag = handle_starttag


def parse_requests(source):
  visible = literal_mask(source)
  requests = []
  stack = []
  for match in _TAG.finditer(visible):
    kind = match['kind'].lower()
    if match['closing']:
      if match['attrs'].strip() or not stack or stack[-1]['kind'] != kind:
        raise ApiRenderError(f'Mismatched closing API tag {match[0]!r}; check the matching <si-docs-{kind}>')
      opening = stack.pop()
      if source[opening['content_start']:match.start()].strip() and kind != 'types':
        raise ApiRenderError(f'<si-docs-{kind}> must be empty; place authored documentation outside the API tag')
      opening['end'] = match.end()
      opening['closing_start'] = match.start()
      continue
    tag_source = source[match.start():match.end()]
    self_closing = match['attrs'].rstrip().endswith('/')
    if self_closing:
      # Normalize XML-style placeholders with unquoted selectors (name=Foo/>)
      # before HTMLParser, whose HTML rules otherwise include / in the value.
      tag_source = tag_source[:-1].rstrip()[:-1] + ' />'
    attrs = _Attributes(tag_source).attributes
    if stack and stack[-1]['kind'] != 'types':
      raise ApiRenderError('Only <si-docs-types> can contain nested API tags')
    if kind == 'types':
      if attrs:
        raise ApiRenderError('<si-docs-types> does not accept attributes')
      request = {'mode': 'types'}
    else:
      names = [attrs[key] for key in ('name', 'component', 'directive', 'injectable', 'pipe', 'service', 'class', 'interface', 'function', 'enum', 'type') if key in attrs]
      if len(names) != 1 or not names[0].strip():
        raise ApiRenderError(f'<si-docs-{kind}> needs exactly one name/component/directive/injectable selector and optional package')
      if 'noheading' in attrs and attrs['noheading'].lower() not in ('true', 'false'):
        raise ApiRenderError('API tag noHeading must be "true" or "false"')
      request = {'mode': kind, 'name': names[0], 'package': attrs.get('importpath') or attrs.get('package'),
                 'heading': attrs.get('heading'), 'no_heading': attrs.get('noheading', 'false').lower() == 'true'}
    request.update(kind=kind, start=match.start(), content_start=match.end())
    if stack:
      # Child explicit type embeds are rendered in their authored position;
      # the wrapper becomes a separate trailing related-types placeholder.
      if kind != 'type':
        raise ApiRenderError('<si-docs-types> may contain only <si-docs-type> tags')
      request['parent'] = stack[-1]
    requests.append(request)
    if self_closing:
      request['end'] = match.end()
    else:
      stack.append(request)
  if stack:
    raise ApiRenderError(f'Unclosed <si-docs-{stack[-1]["kind"]}> tag; add a matching closing tag')
  # Report malformed starts too, instead of leaving unrendered API markup.
  starts = list(re.finditer(r'</?si-docs-(?:api|types|type)\b', visible, re.IGNORECASE))
  if len(starts) != len(list(_TAG.finditer(visible))):
    raise ApiRenderError('Malformed API tag: check attribute quotes and the closing >')
  for request in requests:
    if request['mode'] != 'types':
      continue
    cursor = request['content_start']
    for child in requests:
      if child.get('parent') is request:
        if source[cursor:child['start']].strip():
          raise ApiRenderError('<si-docs-types> supports only nested <si-docs-type> tags, not authored content')
        cursor = child['end']
    if source[cursor:request.get('closing_start', request['end'])].strip():
      raise ApiRenderError('<si-docs-types> supports only nested <si-docs-type> tags, not authored content')
  return requests


class ElementApiExtension(Extension):
  def __init__(self, artifact_path, artifact_revision):
    super().__init__()
    self.artifact_path = Path(artifact_path)
    self.artifact_revision = artifact_revision

  def renderer(self):
    path = self.artifact_path
    try:
      stat = path.stat()
      stamp = (str(path.resolve()), stat.st_mtime_ns, stat.st_size, stat.st_ino, self.artifact_revision)
      # Check each page's lightweight stamp so atomic replacements reload.
      return _load_renderer(*stamp)
    except (OSError, json.JSONDecodeError) as error:
      raise ApiRenderError(f'Cannot read API artifact {path}: {error}. Regenerate the API artifact.') from error

  def extendMarkdown(self, md):
    md.registerExtension(self)
    md.preprocessors.register(ElementApiPreprocessor(md, self), 'element_api', 29)


class ElementApiPreprocessor(Preprocessor):
  def __init__(self, md, extension):
    super().__init__(md)
    self.extension = extension

  def run(self, lines):
    source = '\n'.join(lines)
    page = ''
    try:
      if 'rendering_context' not in self.md.preprocessors:
        raise ApiRenderError('Native API rendering requires rendering_context')
      page = Path(self.md.preprocessors['rendering_context'].page.path).as_posix()
      requests = parse_requests(source)
      if not requests:
        return lines
      reserved = re.findall(r'\bid\s*=\s*[\"\']([^\"\']+)[\"\']|\{#([^}\s]+)', literal_mask(source))
      rendered = self.extension.renderer().prepare_page(requests, page, [first or second for first, second in reserved])
      replacements = []
      for request, html in zip(requests, rendered):
        if request['mode'] == 'types':
          if any(child.get('parent') is request for child in requests):
            replacements.extend([(request['start'], request['content_start'], ''),
                                 (request['closing_start'], request['end'], html)])
          else:
            replacements.append((request['start'], request['end'], html))
        else:
          replacements.append((request['start'], request['end'], html))
      for start, end, html in sorted(replacements, reverse=True):
        source = source[:start] + html + source[end:]
      return source.splitlines()
    except ApiRenderError as error:
      raise ApiRenderError(f'{page or "API documentation page"}: {error}') from error


def makeExtension(artifact_path, artifact_revision):
  return ElementApiExtension(artifact_path, artifact_revision)
