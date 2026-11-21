"""Replace browser API cards with prepared semantic HTML for native llmstxt.

Only identity and existing anchors are read from browser HTML. All exported API
content, including browser-hidden declarations, comes from the prepared artifact.
Unrelated source HTML is retained byte-for-byte, not parsed and reserialized.
"""

from copy import deepcopy
from functools import partial
from html.parser import HTMLParser
import posixpath
import re
from urllib.parse import quote, urljoin, urlsplit, urlunsplit

from .adapter import ApiRenderError, safe_url, symbol_view
from .renderer import ApiRenderer, group_anchors, node_anchor, reference_path, view_anchor, view_nodes


class _ApiRegions(HTMLParser):
  _void = frozenset(('area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
                     'link', 'meta', 'param', 'source', 'track', 'wbr'))
  _literal = frozenset(('pre', 'code', 'script', 'style', 'textarea'))

  def __init__(self, source):
    super().__init__(convert_charrefs=False)
    self.source = source
    self.lines = [0] + [match.end() for match in re.finditer('\n', source)]
    self.stack = []
    self.regions = []
    self.active = None
    self.feed(source)
    self.close()
    if self.active is not None:
      raise ApiRenderError('Unclosed rendered API section in structured export')

  def source_offset(self):
    line, column = self.getpos()
    return self.lines[line - 1] + column

  def handle_starttag(self, tag, attrs):
    attributes = dict(attrs)
    literal = any(item[0] in self._literal for item in self.stack)
    region = None
    if (not literal and self.active is None and tag == 'section' and
        'si-docs-api' in attributes.get('class', '').split() and
        'data-api-symbol' in attributes):
      region = {'start': self.source_offset(), 'attrs': attributes, 'ids': [], 'type_targets': {}}
      self.regions.append(region)
      self.active = region
    if self.active is not None and not literal and attributes.get('id'):
      self.active['ids'].append(attributes['id'])
      if attributes.get('data-api-type-target-for'):
        self.active['type_targets'][attributes['data-api-type-target-for']] = attributes['id']
    if tag not in self._void:
      self.stack.append((tag, region))

  def handle_startendtag(self, tag, attrs):
    self.handle_starttag(tag, attrs)
    if tag not in self._void:
      self.handle_endtag(tag)

  def handle_endtag(self, tag):
    for index in range(len(self.stack) - 1, -1, -1):
      if self.stack[index][0] != tag:
        continue
      for _, region in self.stack[index:]:
        if region is not None:
          region['end'] = self.source.index('>', self.source_offset()) + 1
          self.active = None
      del self.stack[index:]
      break


def _directory_url(path):
  """Prepared referencePath uses source identities and directory-style URLs."""
  if path == 'index.md':
    return ''
  return path[:-8] if path.endswith('/index.md') else path[:-3] + '/'


def preprocess_api(html: str, data: dict, output: str, site_url: str, *, renderer: ApiRenderer | None = None) -> str:
  """Render prepared API export HTML before Zensical's native HTML conversion.

  ``output`` is the site-relative native Markdown destination, not a docs source
  path: ``foo/index.md`` maps to ``foo/`` and ``foo.md`` maps to ``foo.html``.
  Generated symbol links target browser pages relative to the Markdown export.
  The artifact is read-only and no page-local state survives this call.
  A renderer constructed from ``data`` may be shared across calls to reuse the
  validated artifact and Jinja environment/template cache.
  """
  if 'data-api-symbol' not in html:
    return html
  regions = _ApiRegions(html).regions
  if not regions:
    return html
  renderer = renderer if renderer is not None else ApiRenderer(data)
  adapter = renderer.adapter
  template = renderer.environment.get_template('structured.html.jinja')
  base = safe_url(site_url.rstrip('/') + '/')
  parsed_base = urlsplit(base)
  if parsed_base.scheme not in ('http', 'https') or parsed_base.query or parsed_base.fragment:
    raise ApiRenderError('Structured API export requires an absolute HTTP(S) site_url')
  page_path = _directory_url(output) if output.endswith('/index.md') or output == 'index.md' else output.removesuffix('.md') + '.html'
  page_url = urljoin(base, quote(page_path, safe='/-_.~'))
  page_targets = {}
  occurrences = []

  for region in regions:
    attrs = region['attrs']
    symbol_id, mode = attrs['data-api-symbol'], attrs.get('data-api-mode')
    if symbol_id not in adapter.symbols or mode not in ('api', 'type'):
      raise ApiRenderError(f'Unknown rendered API selection {symbol_id!r}/{mode!r}')
    symbol = adapter.symbols[symbol_id]
    member_id = attrs.get('data-api-member')
    if member_id is not None:
      member = data['members'].get(member_id)
      if member is None or member['symbolId'] != symbol_id:
        raise ApiRenderError(f'Unknown rendered API member {member_id!r}')
      view = deepcopy(member['view'])
    else:
      view = deepcopy(symbol_view(symbol, mode, attrs.get('data-api-hide-implicitly-public') == 'true'))
    occurrence = {'symbol': symbol, 'view': view, 'member': member_id is not None,
                  'source': reference_path(attrs.get('data-api-source')),
                  'heading': attrs.get('data-api-heading', symbol['name']),
                  'no_heading': attrs.get('data-api-no-heading') == 'true', 'local': {},
                  'type_targets': region['type_targets']}
    # Match the prepared traversal to IDs actually emitted in this occurrence.
    # Never assume canonical anchors survived authored collisions or repeats.
    nodes = list(view_nodes(view))
    if member_id is None:
      nodes.insert(0, {'id': symbol_id})
    position = 0
    for node in nodes:
      target = adapter.targets.get(node['id'])
      if target is None:
        raise ApiRenderError(f'Prepared API node {node["id"]!r} has no target registry entry')
      base = view_anchor(symbol, mode, node_anchor(node, view, adapter.targets[symbol_id]['anchor'], target['anchor']))
      pattern = re.compile(re.escape(base) + r'(?:--(?:[2-9]|[1-9][0-9]+))?\Z')
      anchor = next((value for value in region['ids'][position:] if pattern.fullmatch(value)), None)
      if anchor is None:
        raise ApiRenderError(f'Rendered API node {node["id"]!r} has no existing browser anchor on {output}')
      position = region['ids'].index(anchor, position) + 1
      node['anchor'] = anchor
      occurrence['local'].setdefault(node['id'], anchor)
      page_targets.setdefault(node['id'], anchor)
    occurrence['symbol_anchor'] = nodes[0]['anchor'] if member_id is None else None
    anchor_base = occurrence['symbol_anchor'] or nodes[0]['anchor']
    for group, base_anchor in group_anchors(view, anchor_base):
      pattern = re.compile(re.escape(base_anchor) + r'(?:--(?:[2-9]|[1-9][0-9]+))?\Z')
      group['anchor'] = next(value for value in region['ids'] if pattern.fullmatch(value))
    occurrences.append(occurrence)

  def absolute_url(value, source):
    value = safe_url(value)
    parsed = urlsplit(value)
    if parsed.scheme or parsed.netloc:
      return value
    # Fragment/query-only links address the actual browser page, not its source
    # Markdown identity. Paths, however, are relative to the authored source
    # directory, which differs from the browser directory for non-index pages.
    if not parsed.path:
      return urljoin(page_url, value)
    source_url = urljoin(base, quote(source, safe='/-_.~'))
    resolved = urlsplit(urljoin(source_url, value))
    if resolved.path.endswith('.md'):
      path = _directory_url(resolved.path)
      return urlunsplit((resolved.scheme, resolved.netloc, path, resolved.query, resolved.fragment))
    return urlunsplit(resolved)

  def href(fragment, local, source):
    target_id = fragment['targetId']
    if target_id is None:
      return absolute_url(fragment['href'], source)
    target = adapter.targets.get(target_id)
    if target is None:
      raise ApiRenderError(f'Unknown logical API target {target_id!r} on {output}')
    anchor = local.get(target_id) or page_targets.get(target_id)
    if anchor:
      path = posixpath.basename(output).removesuffix('.md') + '.html'
    else:
      symbol = adapter.symbols[target['symbolId']]
      canonical = symbol['referencePath']
      if canonical is None:
        return None
      # Zensical rewrites trailing-slash links to index.md after preprocessing.
      path = posixpath.relpath(_directory_url(canonical) + 'index.html',
                               posixpath.dirname(output.lstrip('/')) or '.')
      mode = 'type' if '/types/' in canonical else 'api'
      anchor = view_anchor(symbol, mode, target['anchor'])
    return quote(path, safe='/-_.~') + '#' + quote(anchor, safe='-_.~:')

  result = []
  position = 0
  for region, occurrence in zip(regions, occurrences):
    result.append(html[position:region['start']])
    result.append(template.render(**occurrence, href=partial(href, source=occurrence['source']),
                                  safe_url=partial(absolute_url, source=occurrence['source'])))
    position = region['end']
  result.append(html[position:])
  return ''.join(result)
