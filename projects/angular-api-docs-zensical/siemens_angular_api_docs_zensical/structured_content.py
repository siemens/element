"""Preserve color meaning and canonical browser links in export-only HTML."""

from html import escape, unescape
from html.parser import HTMLParser
import re
from urllib.parse import urljoin


_VOID_ELEMENTS = frozenset({
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link',
  'meta', 'param', 'source', 'track', 'wbr',
})
_LITERAL_ELEMENTS = frozenset({
  'pre', 'code', 'script', 'style', 'textarea', 'title', 'xmp',
  'iframe', 'noembed', 'noframes', 'plaintext', 'template',
})
_ATTRIBUTE = re.compile(r'''([^\s/=>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?''')
_SCHEME = re.compile(r'^[a-zA-Z][a-zA-Z0-9+.-]*:')


def _browser_url(output: str, site_url: str) -> str:
  route = output.lstrip('/')
  if route == 'index.md':
    route = ''
  elif route.endswith('/index.md'):
    route = route[:-len('index.md')]
  elif route.endswith('.md'):
    route = route[:-3] + '.html'
  return urljoin(site_url.rstrip('/') + '/', route)


def _absolute_links(raw: str, browser_url: str) -> str:
  # Tokenize attributes so href-like text inside another attribute is untouched.
  # Replace only relative href values, retaining all other bytes of the tag.
  tag_end = re.match(r'<[^\s/>]+', raw).end()
  parts = []
  offset = 0
  for match in _ATTRIBUTE.finditer(raw, tag_end):
    if match[1].lower() != 'href':
      continue
    group = next((index for index in (2, 3, 4) if match[index] is not None), None)
    if group is None:
      continue
    href = unescape(match[group])
    if _SCHEME.match(href) or href.startswith('//'):
      continue
    start, end = match.span(group)
    if group in (2, 3):
      start -= 1
      end += 1
    parts.extend((raw[offset:start], '"' + escape(urljoin(browser_url, href), quote=True) + '"'))
    offset = end
  parts.append(raw[offset:])
  return ''.join(parts)


def _declarations(style: str) -> list[str]:
  # A semicolon inside a quoted string or function (e.g. a data URL) is not
  # a declaration boundary. This only tokenizes; it does not interpret CSS.
  declarations = []
  start = depth = 0
  quote = ''
  escaped = False
  for index, character in enumerate(style):
    if escaped:
      escaped = False
    elif character == '\\':
      escaped = True
    elif quote:
      if character == quote:
        quote = ''
    elif character in {'"', "'"}:
      quote = character
    elif character == '(':
      depth += 1
    elif character == ')':
      depth = max(0, depth - 1)
    elif character == ';' and not depth:
      declarations.append(style[start:index])
      start = index + 1
  declarations.append(style[start:])
  return declarations


def _background(attrs: list[tuple[str, str | None]]) -> str:
  # Read authored declarations only: no CSS resolution, URL access, or inferred
  # values from classes. Values become escaped code text, never style attributes.
  style = next((value or '' for name, value in attrs if name == 'style'), '')
  value = ''
  for declaration in _declarations(style):
    property_name, separator, authored = declaration.partition(':')
    if separator and property_name.strip().lower() in {'background', 'background-color'}:
      if authored.strip():
        value = authored.strip()
  return value


class _ContentParser(HTMLParser):
  def __init__(self, html: str, browser_url: str):
    super().__init__(convert_charrefs=False)
    self.html = html
    self.browser_url = browser_url
    self.line_offsets = [0, *(match.end() for match in re.finditer('\n', html))]
    self.stack: list[str] = []
    self.replacements: list[tuple[int, int, str]] = []

  def _offset(self) -> int:
    line, column = self.getpos()
    return self.line_offsets[line - 1] + column

  def _literal(self) -> bool:
    return any(tag in _LITERAL_ELEMENTS for tag in self.stack)

  def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
    if tag == 'si-docs-color' and not self._literal():
      start = self._offset()
      value = _background(attrs)
      replacement = f'<code>{escape(value, quote=False)}</code>' if value else ''
      self.replacements.append((start, start + len(self.get_starttag_text()), replacement))
    elif not self._literal():
      raw = self.get_starttag_text()
      replacement = _absolute_links(raw, self.browser_url)
      if replacement != raw:
        start = self._offset()
        self.replacements.append((start, start + len(raw), replacement))
    if tag not in _VOID_ELEMENTS:
      self.stack.append(tag)

  def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
    self.handle_starttag(tag, attrs)
    if tag not in _VOID_ELEMENTS:
      self.stack.pop()

  def handle_endtag(self, tag: str) -> None:
    if tag == 'si-docs-color' and tag in self.stack and not self._literal():
      start = self._offset()
      self.replacements.append((start, self.html.index('>', start) + 1, ''))
    if tag in self.stack:
      del self.stack[len(self.stack) - 1 - self.stack[::-1].index(tag):]


def preprocess_content(html: str, output: str, site_url: str) -> str:
  """Export readable swatches and absolute canonical browser hrefs.

  ``output`` is the native Markdown output route. Resolve rendered relative hrefs
  against its browser equivalent under ``site_url``; do not reinterpret authored
  destination extensions or resolve them as source Markdown. Images stay native.
  Preserve child content even without a color, and preserve all other input
  verbatim, including comments and code/literal elements. CSS is not evaluated:
  the last nonempty background/background-color declaration is exported as
  inert code text. No default colors or computed styles are invented.
  """
  parser = _ContentParser(html, _browser_url(output, site_url))
  parser.feed(html)
  parser.close()
  parts = []
  offset = 0
  for start, end, replacement in parser.replacements:
    parts.extend((html[offset:start], replacement))
    offset = end
  parts.append(html[offset:])
  return ''.join(parts)
