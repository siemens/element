"""Expand live examples only in HTML passed to the native structured exporter.

No browser markup is changed by this module. The caller supplies the examples
directory (normally ``src/app/examples``); no other source trees are consulted.
"""

from html import escape
from html.parser import HTMLParser
from pathlib import Path
import re
from urllib.parse import urlsplit


_VOID_ELEMENTS = frozenset({
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link',
  'meta', 'param', 'source', 'track', 'wbr',
})


def _attributes(attrs: list[tuple[str, str | None]]) -> dict[str, str | None]:
  result = {}
  for name, value in attrs:
    if name in {'example', 'base', 'heading'} and name in result:
      raise ValueError(f'Duplicate {name!r} attribute on documentation example')
    result[name] = value
  return result


def _value(attrs: dict[str, str | None], name: str, default: str = '') -> str:
  value = attrs.get(name, default)
  if value is None or value != value.strip() or (name == 'example' and not value):
    raise ValueError(f'Invalid {name!r} attribute on documentation example')
  return value


def _external(value: str) -> bool:
  return value.lower().startswith(('http://', 'https://'))


def _validate_reference(value: str, *, allow_empty: bool = False) -> None:
  if not value and allow_empty:
    return
  if not value or re.search(r'[\x00-\x20\x7f\\]', value):
    raise ValueError(f'Invalid documentation example path: {value!r}')
  if _external(value):
    try:
      url = urlsplit(value)
      # Accessing port also validates malformed or out-of-range port numbers.
      _ = url.port
      if url.hostname and url.netloc:
        return
    except ValueError:
      pass
    raise ValueError(f'Invalid external documentation example URL: {value!r}')
  if value.startswith('/') or any(part in {'', '.', '..'} for part in value.split('/')) or re.search(r'[:%?#]', value):
    raise ValueError(f'Unsafe documentation example path: {value!r}')


def _source(root: Path, reference: str, suffix: str, *, optional: bool = False) -> str | None:
  path = root / (reference + suffix)
  resolved = path.resolve()
  if not resolved.is_relative_to(root):
    raise ValueError(f'Documentation example escapes examples root: {reference + suffix}')
  if optional and not path.exists():
    # A broken symlink is an invalid source, not an absent optional template.
    if not path.is_symlink():
      return None
  try:
    with path.open(encoding='utf-8', newline='') as stream:
      return stream.read()
  except OSError as error:
    raise ValueError(f'Cannot read documentation example source {reference + suffix}: {error}') from error


def _render(root: Path, base: str, examples: list[tuple[str, str]]) -> str:
  if not examples:
    raise ValueError('si-docs-component requires an example or direct si-docs-tab[example] children')
  parts = ['<h4>Example</h4>']
  for example, heading in examples:
    _validate_reference(example)
    reference = f'{base}/{example}' if base else example
    _validate_reference(reference)
    if heading or len(examples) > 1:
      parts.append(f'<h5>{escape(heading or example)}</h5>')
    if _external(reference):
      parts.append(f'<p><a href="{escape(reference, quote=True)}">{escape(reference)}</a></p>')
      continue
    component = _source(root, reference, '.ts')
    template = _source(root, reference, '.html', optional=True)
    parts.append(f'<p>Component:</p><pre><code class="language-typescript">{escape(component, quote=False)}</code></pre>')
    if template is not None:
      parts.append(f'<p>Template:</p><pre><code class="language-html">{escape(template, quote=False)}</code></pre>')
  return '\n'.join(parts)


class _ExampleParser(HTMLParser):
  def __init__(self, html: str, examples_root: Path):
    super().__init__(convert_charrefs=False)
    self.html = html
    self.root = examples_root.resolve()
    self.line_offsets = [0]
    self.line_offsets.extend(match.end() for match in re.finditer('\n', html))
    self.stack: list[str] = []
    self.start: int | None = None
    self.base = ''
    self.examples: list[tuple[str, str]] = []
    self.replacements: list[tuple[int, int, str]] = []

  def _offset(self) -> int:
    line, column = self.getpos()
    return self.line_offsets[line - 1] + column

  def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
    if 'pre' not in self.stack and 'code' not in self.stack:
      if tag == 'si-docs-component':
        if self.start is not None:
          raise ValueError('Nested si-docs-component elements are not supported')
        attributes = _attributes(attrs)
        self.start = self._offset()
        raw_base = _value(attributes, 'base')
        if raw_base.startswith('/'):
          raise ValueError(f'Unsafe documentation example path: {raw_base!r}')
        self.base = raw_base.removesuffix('/')
        _validate_reference(self.base, allow_empty=True)
        self.examples = []
        if 'example' in attributes:
          self.examples.append((_value(attributes, 'example'), ''))
      elif tag == 'si-docs-tab' and self.start is not None and self.stack[-1:] == ['si-docs-component']:
        attributes = _attributes(attrs)
        if 'example' in attributes:
          self.examples.append((_value(attributes, 'example'), _value(attributes, 'heading')))
    if tag not in _VOID_ELEMENTS:
      self.stack.append(tag)

  def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
    self.handle_starttag(tag, attrs)
    if tag not in _VOID_ELEMENTS:
      self.handle_endtag(tag)

  def handle_endtag(self, tag: str) -> None:
    if tag == 'si-docs-component' and self.start is not None and 'pre' not in self.stack and 'code' not in self.stack:
      # For self-closing input, getpos() still points at the opening tag.
      end = (self.start + len(self.get_starttag_text()) if self._offset() == self.start
             else self.html.index('>', self._offset()) + 1)
      self.replacements.append((self.start, end, _render(self.root, self.base, self.examples)))
      self.start = None
    if tag in self.stack:
      del self.stack[len(self.stack) - 1 - self.stack[::-1].index(tag):]


def preprocess_examples(html: str, examples_root: Path) -> str:
  """Return semantic example source HTML, preserving all other input verbatim.

  Like the browser component, a parent example precedes direct child tabs, the
  parent's base applies to all of them, and tab labels use heading or example.
  HTTP(S) examples remain links and are never fetched. Invalid attributes,
  unsafe paths, and unreadable required sources raise ``ValueError``. Adjacent
  HTML is optional; TypeScript is included exactly, without interpreting imports.
  """
  parser = _ExampleParser(html, examples_root)
  parser.feed(html)
  parser.close()
  if parser.start is not None:
    raise ValueError('Unclosed si-docs-component element')
  parts = []
  offset = 0
  for start, end, replacement in parser.replacements:
    parts.extend((html[offset:start], replacement))
    offset = end
  parts.append(html[offset:])
  return ''.join(parts)
