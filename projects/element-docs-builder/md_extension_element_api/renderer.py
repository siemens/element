"""Page-local selection, anchor allocation and templates for prepared API views."""

from copy import deepcopy
import posixpath
from pathlib import Path
from urllib.parse import quote, urlsplit

from jinja2 import Environment, FileSystemLoader, StrictUndefined, select_autoescape

from .adapter import ApiRenderError, ApiSelection, PresentationAdapter, safe_url


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
    self.template = self.environment.get_template('symbol.html.jinja')
    self.member_template = self.environment.get_template('member.html.jinja')

  def prepare_page(self, requests, current_file_path, reserved_ids):
    """Resolve the entire page before rendering, including forward/local links."""
    explicit = []
    for request in requests:
      if request['mode'] != 'types':
        selection = self.adapter.select(request['name'], request.get('package'), request['mode'])
        request['selection'] = selection
        explicit.append(selection)
    related = self.adapter.related_types(explicit)
    embeds = []
    by_request = []
    for request in requests:
      selections = [ApiSelection(symbol, 'type', symbol['type']) for symbol in related] if request['mode'] == 'types' else [request['selection']]
      occurrences = []
      for selection in selections:
        symbol = selection.owner
        occurrence = {'symbol': symbol, 'mode': selection.mode, 'member': selection.member, 'view': deepcopy(selection.view), 'local': {},
                      'heading': request.get('heading') or symbol['name'], 'no_heading': request.get('no_heading', False)}
        occurrences.append(occurrence)
        embeds.append(occurrence)
      by_request.append(occurrences)
    used = set(reserved_ids)
    page_targets = {}

    def allocate(node_id, occurrence):
      target = self.adapter.targets.get(node_id)
      if target is None:
        raise ApiRenderError(f'Prepared API node {node_id!r} has no target registry entry; regenerate the artifact')
      base = target['anchor']
      anchor = base
      suffix = 2
      while anchor in used:
        anchor = f'{base}--{suffix}'
        suffix += 1
      used.add(anchor)
      occurrence['local'].setdefault(node_id, anchor)
      page_targets.setdefault(node_id, anchor)
      return anchor

    def register_signatures(signatures, occurrence):
      for signature in signatures:
        signature['anchor'] = allocate(signature['id'], occurrence)
        register_rows(signature['parameters'], occurrence)

    def register_rows(rows, occurrence):
      for row in rows:
        row['anchor'] = allocate(row['id'], occurrence)
        register_signatures(row['signatures'], occurrence)

    for occurrence in embeds:
      if not occurrence['member']:
        occurrence['symbol_anchor'] = allocate(occurrence['symbol']['id'], occurrence)
      register_signatures(occurrence['view']['signatures'], occurrence)
      for group in occurrence['view']['groups']:
        register_rows(group['rows'], occurrence)

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
      return quote(posixpath.relpath(canonical, directory), safe='/-_.~') + '#' + quote(target['anchor'], safe='-_.~:')

    return ['\n\n' + '\n'.join((self.member_template if occurrence['member'] else self.template).render(**occurrence, href=href) for occurrence in occurrences) + '\n\n'
            for occurrences in by_request]
