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
    raise ApiRenderError(f'Cannot load API artifact {path}: {error}. Run pnpm docs:generate-api.') from error


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
    self.environment.globals['kind_documentation'] = KIND_DOCUMENTATION
    self.template = self.environment.get_template('symbol.html.jinja')
    self.member_template = self.environment.get_template('member.html.jinja')

  def prepare_page(self, requests, current_file_path, reserved_ids, *, highlight_example=None):
    """Resolve the entire page before rendering, including forward/local links."""
    explicit = []
    for request in requests:
      if request['mode'] != 'types':
        selection = self.adapter.select(request['name'], request.get('package'), request['mode'],
                                        hide_implicitly_public=request.get('hide_implicitly_public', False))
        request['selection'] = selection
        explicit.append(selection)
    related = self.adapter.related_types(explicit)
    # Composer collects type destinations from signatures and documentation
    # links. Explicit API embeds are omitted from related_types to avoid
    # duplicate content, not to discard those incoming type fragments.
    referenced_type_ids = {symbol_id for selection in explicit for symbol_id in selection.view['relatedTypeIds']}
    for view in [selection.view for selection in explicit] + [symbol['type'] for symbol in related]:
      for node in (view, *view_nodes(view)):
        for block in node.get('documentation', []):
          for fragment in block['parts']:
            target = self.adapter.targets.get(fragment['targetId'])
            if target:
              referenced_type_ids.add(target['symbolId'])
    if not any(request['mode'] == 'types' for request in requests):
      referenced_type_ids.clear()
    # Follow the API section order: inputs, outputs, other direct references,
    # then transitive dependencies in the prepared order.
    direct_order = {}
    for priority, kind in enumerate(('inputs', 'outputs', None)):
      for selection in explicit:
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
    embeds = []
    by_request = []
    for request in requests:
      selections = [ApiSelection(symbol, 'type', symbol['type']) for symbol in related] if request['mode'] == 'types' else [request['selection']]
      occurrences = []
      for selection in selections:
        symbol = selection.owner
        occurrence = {'symbol': symbol, 'mode': selection.mode, 'member': selection.member, 'view': deepcopy(selection.view), 'local': {},
                      'source': current_file_path,
                      'heading': request.get('heading') or symbol['name'], 'no_heading': request.get('no_heading', False),
                      'hide_implicitly_public': request.get('hide_implicitly_public', False),
                      'member_id': next((key for key, member in self.adapter.data['members'].items()
                                         if member['view'] is selection.view), '') if selection.member else ''}
        occurrences.append(occurrence)
        embeds.append(occurrence)
      by_request.append(occurrences)
    used = set(reserved_ids)
    page_targets = {}

    def unique_anchor(base):
      anchor = base
      suffix = 2
      while anchor in used:
        anchor = f'{base}--{suffix}'
        suffix += 1
      used.add(anchor)
      return anchor

    def allocate(node_id, occurrence, node=None):
      target = self.adapter.targets.get(node_id)
      if target is None:
        raise ApiRenderError(f'Prepared API node {node_id!r} has no target registry entry; regenerate the artifact')
      base = node_anchor(node, occurrence['view'], self.adapter.targets[occurrence['symbol']['id']]['anchor'],
                         target['anchor']) if node is not None else target['anchor']
      anchor = unique_anchor(view_anchor(occurrence['symbol'], occurrence['mode'], base))
      occurrence['local'].setdefault(node_id, anchor)
      page_targets.setdefault(node_id, anchor)
      return anchor

    for occurrence in embeds:
      if not occurrence['member']:
        occurrence['symbol_anchor'] = allocate(occurrence['symbol']['id'], occurrence)
      for node in view_nodes(occurrence['view']):
        node['anchor'] = allocate(node['id'], occurrence, node)

    for occurrence in embeds:
      base = occurrence.get('symbol_anchor') or next(view_nodes(occurrence['view']))['anchor']
      for group, anchor in group_anchors(occurrence['view'], base):
        group['anchor'] = unique_anchor(anchor)

    # Composer can expose a symbol both as an API and as a referenced type.
    # Keep incoming published type fragments on the corresponding API content
    # without duplicating that content. Real type embeds and authored IDs win.
    for occurrence in embeds:
      occurrence['type_targets'] = {}
      if occurrence['mode'] != 'api' or (occurrence['symbol']['kind'] not in ('component', 'directive') and
                                        occurrence['symbol']['id'] not in referenced_type_ids):
        continue
      for node_id, anchor in occurrence['local'].items():
        type_anchor = view_anchor(occurrence['symbol'], 'type', self.adapter.targets[node_id]['anchor'])
        if type_anchor not in used:
          used.add(type_anchor)
          occurrence['type_targets'][anchor] = type_anchor

    def href(fragment, local):
      if fragment['targetId'] is None:
        return safe_url(fragment['href'])
      target_id = fragment['targetId']
      target = self.adapter.targets.get(target_id)
      if target is None:
        raise ApiRenderError(f'Unknown logical API target {target_id!r} on {current_file_path or "this page"}; regenerate the schema2 artifact or emit an explicit text fragment.')
      anchor = local.get(target_id) or page_targets.get(target_id)
      if anchor:
        return '#' + quote(anchor, safe='-_.~:')
      symbol = self.adapter.symbols[target['symbolId']]
      canonical = symbol['referencePath']
      if canonical is None:
        # Valid unpublished symbols are readable text in authored-only builds.
        return None
      # Native rewrites HTML hrefs: use source-relative Markdown identities.
      directory = posixpath.dirname(current_file_path) or '.'
      mode = 'type' if '/types/' in canonical else 'api'
      return quote(posixpath.relpath(canonical, directory), safe='/-_.~') + '#' + quote(view_anchor(symbol, mode, target['anchor']), safe='-_.~:')

    rendered = []
    for request, occurrences in zip(requests, by_request):
      sections = []
      if request['mode'] == 'types' and occurrences:
        anchor = 'types-documentation'
        suffix = 2
        while anchor in used:
          anchor = f'types-documentation-{suffix}'
          suffix += 1
        used.add(anchor)
        sections.append(f'<h3 id="{anchor}" data-api-toc-label="Types Documentation">Types Documentation'
                        f'<a class="headerlink" href="#{anchor}" title="Permanent link">¶</a></h3>')
      for occurrence in occurrences:
        template = self.member_template if occurrence['member'] else self.template
        sections.append(template.render(**occurrence, href=href, highlight_example=highlight_example))
      rendered.append('\n\n' + '\n'.join(sections) + '\n\n')
    return rendered
