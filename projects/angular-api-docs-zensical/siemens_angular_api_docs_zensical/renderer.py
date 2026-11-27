"""Page-local selection, anchor allocation and templates for prepared API views."""

from copy import deepcopy
from functools import lru_cache
import json
import posixpath
from pathlib import Path
from urllib.parse import quote, urlsplit

from jinja2 import Environment, FileSystemLoader, StrictUndefined, select_autoescape

from .adapter import ApiRenderError, ApiSelection, PresentationAdapter, safe_url


TYPESCRIPT_HANDBOOK = 'https://www.typescriptlang.org/docs/handbook/'
KIND_DOCUMENTATION = {
  'type_alias': TYPESCRIPT_HANDBOOK + '2/everyday-types.html#type-aliases',
  'interface': TYPESCRIPT_HANDBOOK + '2/everyday-types.html#interfaces',
  'class': TYPESCRIPT_HANDBOOK + '2/classes.html',
  'undecorated_class': TYPESCRIPT_HANDBOOK + '2/classes.html',
  'enum': TYPESCRIPT_HANDBOOK + 'enums.html',
  'function': TYPESCRIPT_HANDBOOK + '2/functions.html',
  'constant': TYPESCRIPT_HANDBOOK + 'variable-declarations.html#const-declarations',
  'module': TYPESCRIPT_HANDBOOK + '2/modules.html',
  'component': 'https://angular.dev/api/core/Component',
  'directive': 'https://angular.dev/api/core/Directive',
  'injectable': 'https://angular.dev/api/core/Injectable',
  'pipe': 'https://angular.dev/api/core/Pipe',
  'ng_module': 'https://angular.dev/api/core/NgModule',
}


def load_renderer(path):
  """Share prepared data between pages, reloading after regeneration in serve mode."""
  try:
    path = Path(path).resolve()
    stat = path.stat()
    return _load_renderer(path, stat.st_mtime_ns, stat.st_ctime_ns, stat.st_size)
  except (OSError, ValueError) as error:
    raise ApiRenderError(f'Cannot load API artifact {path}: {error}. Run angular-api-docs extract.') from error


@lru_cache(maxsize=1)
def _load_renderer(path, mtime_ns, ctime_ns, size):
  return ApiRenderer(json.loads(path.read_text(encoding='utf-8')))


def reference_path(value):
  """Canonical references must be docs-relative page paths, not arbitrary URLs."""
  safe_url(value)
  parsed = urlsplit(value)
  if (parsed.scheme or parsed.netloc or parsed.query or parsed.fragment or
      value.startswith('/') or any(part in ('', '.', '..') for part in value.rstrip('/').split('/'))):
    raise ApiRenderError(f'Malformed canonical API referencePath {value!r}: expected a docs-relative page path')
  if not value.endswith('.md'):
    raise ApiRenderError(f'Malformed canonical API referencePath {value!r}: expected a docs-relative .md path')
  return value


def view_nodes(view):
  """Yield anchor-bearing prepared nodes in browser rendering order."""
  def signatures(items):
    for signature in items:
      yield signature
      yield from rows(signature['parameters'])

  def rows(items):
    for row in items:
      yield row
      yield from signatures(row['signatures'])

  yield from signatures(view['signatures'])
  for group in view['groups']:
    yield from rows(group['rows'])


OVERVIEW_GROUP_COMMENTS = {
  'inputs': 'Inputs',
  'outputs': 'Outputs',
  'constructors': 'Constructor',
  'propertys': 'Properties',
  'accessors': 'Accessors',
  'methods': 'Methods',
  'index_signatures': 'Index Signatures',
  'declarations': 'Declarations',
}

_CLASS_DECLARATION_PREFIXES = (
  'undecorated_class ',
  'component ',
  'directive ',
  'injectable ',
  'pipe ',
  'ng_module ',
)


def callable_type(signature, name):
  """Display a member signature as a callable type, retaining linked fragments."""
  parts = [dict(part) for part in signature['label']]
  if parts:
    parts[0]['text'] = parts[0]['text'].removeprefix(name)
    for part in reversed(parts):
      if '): ' in part['text'] and part['kind'] != 'link':
        before, after = part['text'].rsplit('): ', 1)
        part['text'] = before + ') => ' + after
        break
  return parts


def signature_suffix(signature, name):
  """Return a callable signature after its name in TypeScript declaration syntax."""
  parts = [dict(part) for part in signature['label']]
  if parts:
    parts[0]['text'] = parts[0]['text'].removeprefix(name)
  if name == 'constructor':
    for index in range(len(parts) - 1, -1, -1):
      if '): ' in parts[index]['text'] and parts[index]['kind'] != 'link':
        before, _ = parts[index]['text'].rsplit('): ', 1)
        parts[index]['text'] = before + ')'
        del parts[index + 1:]
        break
  return parts


def declaration_header(symbol, view):
  """Normalize a symbol's TypeScript declaration header for the code-first overview."""
  if symbol['kind'] == 'constant':
    if view['declaration']:
      return [{'kind': 'code', 'text': f"const {symbol['name']}: ", 'targetId': None, 'href': None},
              *[dict(part) for part in view['declaration']]]
    return [{'kind': 'code', 'text': f"const {symbol['name']}", 'targetId': None, 'href': None}]
  parts = [dict(part) for part in view['declaration']]
  if parts:
    for prefix in _CLASS_DECLARATION_PREFIXES:
      if parts[0]['text'].startswith(prefix):
        parts[0]['text'] = 'class ' + parts[0]['text'][len(prefix):]
        break
  return parts


def anchor_href(anchor):
  """Format a page-local fragment href while preserving ':' in type anchors."""
  return '#' + quote(anchor, safe='-_.~:')


def overview_group_comment(group):
  """Return a concise TypeScript comment label for a member group in the code overview."""
  if group['kind'] == 'members' and group['title'] == 'Attributes and Methods':
    return 'Properties & Methods'
  return OVERVIEW_GROUP_COMMENTS.get(group['kind'], group['title'])


def node_anchor(node, view, symbol_anchor, target_anchor):
  """Bindings use their published names, including distinct model outputs."""
  for group in view['groups']:
    if group['kind'] in ('inputs', 'outputs') and any(row is node for row in group['rows']):
      name = quote(node['name'].replace('$', '~'), safe="-_.!~*'()")
      return f'{symbol_anchor}.{name}'
  return target_anchor


def view_anchor(symbol, mode, anchor):
  """Published class APIs (including services) and type views use separate namespaces."""
  api_kinds = ('component', 'directive', 'injectable', 'pipe', 'ng_module', 'undecorated_class')
  if (mode == 'type' or symbol['kind'] not in api_kinds) and not anchor.startswith('t:'):
    return 't:' + anchor
  return anchor


def group_anchors(view, symbol_anchor):
  """Use published group fragments for the actual section destinations."""
  attributes = False
  for group in view['groups']:
    kind = group['kind']
    suffix = {'inputs': 'i', 'outputs': 'o'}.get(kind, kind)
    if kind not in ('inputs', 'outputs', 'constructors') and not attributes:
      suffix = 'a'
      attributes = True
    yield group, f'{symbol_anchor}_{suffix}'


def _strip_template_indent(text):
  """Remove template indentation outside fenced code and <pre> blocks so md_in_html never treats HTML as code."""
  lines = []
  fence = None
  in_pre = False
  for line in text.splitlines():
    stripped = line.lstrip()
    if fence is not None:
      lines.append(line)
      if stripped.startswith(fence) and not stripped.strip('`'):
        fence = None
    elif in_pre:
      lines.append(line)
      if '</pre>' in line:
        in_pre = False
    elif stripped.startswith('```'):
      fence = '`' * (len(stripped) - len(stripped.lstrip('`')))
      lines.append(stripped)
    elif stripped.startswith('<pre'):
      lines.append(stripped)
      if '</pre>' not in stripped:
        in_pre = True
    else:
      lines.append(stripped)
  return '\n'.join(lines)


class ApiRenderer:
  def __init__(self, data):
    self.adapter = PresentationAdapter(data)
    for symbol in self.adapter.symbols.values():
      if symbol['referencePath'] is not None:
        reference_path(symbol['referencePath'])
    self.environment = Environment(
      loader=FileSystemLoader(Path(__file__).parent / 'templates'),
      undefined=StrictUndefined,
      autoescape=select_autoescape(default=True, default_for_string=True),
      trim_blocks=True,
      lstrip_blocks=True,
    )
    self.environment.globals['safe_url'] = safe_url
    self.environment.globals['callable_type'] = callable_type
    self.environment.globals['signature_suffix'] = signature_suffix
    self.environment.globals['declaration_header'] = declaration_header
    self.environment.globals['anchor_href'] = anchor_href
    self.environment.globals['overview_group_comment'] = overview_group_comment
    self.environment.globals['kind_documentation'] = KIND_DOCUMENTATION
    self.template = self.environment.get_template('html/symbol.html.jinja')
    self.member_template = self.environment.get_template('html/member.html.jinja')

  def for_page(self, current_file_path: str, *, has_types_section: bool = False):
    """Create a per-page rendering session for Zensical's Jinja macros."""
    return ApiPageRenderer(self, current_file_path, has_types_section=has_types_section)


class ApiPageRenderer:
  """Track page-local embeds, anchors, and related types across macro calls."""

  def __init__(self, renderer: ApiRenderer, current_file_path: str, *, has_types_section: bool = False):
    self.renderer = renderer
    self.adapter = renderer.adapter
    self.current_file_path = current_file_path
    self.has_types_section = has_types_section
    self.explicit: list[ApiSelection] = []
    self.used: set[str] = set()
    self.page_targets: dict[str, str] = {}

  def _unique_anchor(self, base: str) -> str:
    anchor = base
    suffix = 2
    while anchor in self.used:
      anchor = f'{base}--{suffix}'
      suffix += 1
    self.used.add(anchor)
    return anchor

  def _allocate(self, node_id: str, occurrence: dict, node=None) -> str:
    target = self.adapter.targets.get(node_id)
    if target is None:
      raise ApiRenderError(f'Prepared API node {node_id!r} has no target registry entry; regenerate the artifact')
    base = node_anchor(node, occurrence['view'], self.adapter.targets[occurrence['symbol']['id']]['anchor'],
                       target['anchor']) if node is not None else target['anchor']
    anchor = self._unique_anchor(view_anchor(occurrence['symbol'], occurrence['mode'], base))
    occurrence['local'].setdefault(node_id, anchor)
    self.page_targets.setdefault(node_id, anchor)
    return anchor

  def _render_occurrence(self, selection: ApiSelection, *, heading=None, no_heading=False,
                         hide_implicitly_public=False, pending_type_ids=frozenset()) -> str:
    symbol = selection.owner
    occurrence = {
      'symbol': symbol,
      'mode': selection.mode,
      'member': selection.member,
      'view': deepcopy(selection.view),
      'local': {},
      'source': self.current_file_path,
      'heading': heading or symbol['name'],
      'no_heading': no_heading,
      'hide_implicitly_public': hide_implicitly_public,
      'member_id': selection.member_id,
    }
    if not occurrence['member']:
      occurrence['symbol_anchor'] = self._allocate(symbol['id'], occurrence)
    for node in view_nodes(occurrence['view']):
      node['anchor'] = self._allocate(node['id'], occurrence, node)
    base = occurrence.get('symbol_anchor') or next(view_nodes(occurrence['view']))['anchor']
    for group, anchor in group_anchors(occurrence['view'], base):
      group['anchor'] = self._unique_anchor(anchor)

    # Keep incoming published type fragments on the corresponding API content
    # without duplicating that content.
    occurrence['type_targets'] = {}
    if occurrence['mode'] == 'api' and (symbol['kind'] in ('component', 'directive') or self.has_types_section):
      for node_id, anchor in occurrence['local'].items():
        type_anchor = view_anchor(symbol, 'type', self.adapter.targets[node_id]['anchor'])
        if type_anchor not in self.used:
          self.used.add(type_anchor)
          occurrence['type_targets'][anchor] = type_anchor

    def href(fragment, local):
      if fragment['targetId'] is None:
        return safe_url(fragment['href'])
      target_id = fragment['targetId']
      target = self.adapter.targets.get(target_id)
      if target is None:
        raise ApiRenderError(f'Unknown logical API target {target_id!r} on {self.current_file_path or "this page"}; regenerate the schema2 artifact or emit an explicit text fragment.')
      anchor = local.get(target_id) or self.page_targets.get(target_id)
      if anchor:
        return '#' + quote(anchor, safe='-_.~:')
      target_symbol = self.adapter.symbols[target['symbolId']]
      if target['symbolId'] in pending_type_ids:
        return '#' + quote(view_anchor(target_symbol, 'type', target['anchor']), safe='-_.~:')
      canonical = target_symbol['referencePath']
      if canonical is None:
        # Valid unpublished symbols are readable text in authored-only builds.
        return None
      # Native rewrites HTML hrefs: use source-relative Markdown identities.
      directory = posixpath.dirname(self.current_file_path) or '.'
      mode = 'type' if '/types/' in canonical else 'api'
      return quote(posixpath.relpath(canonical, directory), safe='/-_.~') + '#' + quote(view_anchor(target_symbol, mode, target['anchor']), safe='-_.~:')

    template = self.renderer.member_template if occurrence['member'] else self.renderer.template
    return _strip_template_indent(template.render(**occurrence, href=href))

  def render_symbol(self, name: str, *, mode: str, package=None, heading=None,
                    no_heading=False, hide_implicitly_public=False) -> str:
    selection = self.adapter.select(name, package, mode, hide_implicitly_public=hide_implicitly_public)
    self.explicit.append(selection)
    pending = frozenset(selection.view['relatedTypeIds']) if self.has_types_section else frozenset()
    return '\n\n' + self._render_occurrence(
      selection, heading=heading, no_heading=no_heading,
      hide_implicitly_public=hide_implicitly_public, pending_type_ids=pending,
    ) + '\n\n'

  def render_types(self) -> str:
    related = self.adapter.related_types(self.explicit)
    if not related:
      return ''
    # Follow the API section order: inputs, outputs, other direct references,
    # then transitive dependencies in the prepared order.
    direct_order = {}
    for priority, kind in enumerate(('inputs', 'outputs', None)):
      for selection in self.explicit:
        view = selection.view
        if kind is None:
          nodes = [view, *view_nodes(view)]
        else:
          nodes = [row for group in view['groups'] if group['kind'] == kind for row in group['rows']]
        for node in nodes:
          for field in ('declaration', 'type', 'label', 'returns'):
            for fragment in node.get(field, []):
              target = self.adapter.targets.get(fragment['targetId'])
              if target:
                direct_order.setdefault(target['symbolId'], priority)
    related.sort(key=lambda symbol: (direct_order[symbol['id']], symbol['name'].casefold())
                 if symbol['id'] in direct_order else (3, ''))

    anchor = 'types-documentation'
    suffix = 2
    while anchor in self.used:
      anchor = f'types-documentation-{suffix}'
      suffix += 1
    self.used.add(anchor)

    pending = frozenset(symbol['id'] for symbol in related)
    sections = [f'### Types Documentation {{#{anchor}}}']
    for symbol in related:
      sections.append(self._render_occurrence(ApiSelection(symbol, 'type', symbol['type']), pending_type_ids=pending))
    return '\n\n' + '\n\n'.join(sections) + '\n\n'
