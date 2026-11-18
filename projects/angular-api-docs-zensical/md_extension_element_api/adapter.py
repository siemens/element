"""Resolve authored requests against producer-prepared presentation data."""

import re
from dataclasses import dataclass
from urllib.parse import urlsplit

from .schema import SCHEMA_VERSION


class ApiRenderError(ValueError):
  """An invalid prepared artifact or an unresolvable authored API placeholder."""


def validate_api_schema(data):
  if not isinstance(data, dict) or data.get('schemaVersion') != SCHEMA_VERSION:
    raise ApiRenderError(f'API artifact must use schemaVersion {SCHEMA_VERSION}; run pnpm docs:generate-api.')


@dataclass(frozen=True)
class ApiSelection:
  owner: dict
  mode: str
  view: dict
  member: bool = False


def safe_url(value):
  if not isinstance(value, str) or not value or re.search(r'[\x00-\x20\x7f\\]', value):
    raise ApiRenderError(f'Unsafe API documentation URL: {value!r}')
  try:
    parsed = urlsplit(value)
    parsed.port  # Validates the port like the TypeScript URL check.
  except ValueError as error:
    raise ApiRenderError(f'Malformed API documentation URL: {value!r}') from error
  if parsed.scheme.lower() not in ('', 'https', 'http', 'mailto') or value.startswith('//'):
    raise ApiRenderError(f'Unsafe API documentation URL scheme: {value!r}')
  if parsed.scheme.lower() in ('http', 'https') and not parsed.netloc:
    raise ApiRenderError(f'API documentation URL has no host: {value!r}')
  return value


def symbol_view(symbol, mode, hide_implicitly_public=False):
  if mode == 'api' and hide_implicitly_public:
    return symbol.get('explicitPublicApi', symbol['api'])
  return symbol[mode]


class PresentationAdapter:
  def __init__(self, data):
    validate_api_schema(data)
    self.data = data
    self.symbols = {symbol['id']: symbol for symbol in data['symbols']}
    self.targets = data['targets']

  def lookup(self, name, package):
    key = f'{package}#{name}' if package else name
    # A qualified canonical identity is more specific than the package-name
    # aggregate, which may also contain secondary-entrypoint reexports.
    if key in self.symbols:
      return self.symbols[key]
    candidates = self.data['index'].get(key, [])
    if not candidates:
      raise ApiRenderError(f'API symbol {key!r} was not found. Check name/package and regenerate the API artifact.')
    if len(candidates) > 1:
      choices = ', '.join(f'{self.symbols[item]["importPath"]}#{self.symbols[item]["name"]}' for item in candidates)
      raise ApiRenderError(f'Ambiguous API symbol {key!r}: {choices}. Add an exact package/import path attribute.')
    return self.symbols[candidates[0]]

  def select(self, name, package, mode, *, hide_implicitly_public=False):
    """Both member tags render the same producer-selected view."""
    key = f'{package}#{name}' if package else name
    if key in self.symbols or self.data['index'].get(key):
      owner = self.lookup(name, package)
      return ApiSelection(owner, mode, symbol_view(owner, mode, hide_implicitly_public))
    candidates = self.data['memberIndex'].get(key, [])
    if len(candidates) > 1:
      raise ApiRenderError(f'Ambiguous API member {key!r}; add an exact importPath attribute')
    if not candidates:
      self.lookup(name, package)  # Keep the normal lookup's actionable diagnostic.
    member = self.data['members'][candidates[0]]
    return ApiSelection(self.symbols[member['symbolId']], mode, member['view'], member=True)

  def related_types(self, selections):
    """Union prepared transitive IDs, excluding every explicitly embedded owner."""
    seen = {selection.owner['id'] for selection in selections}
    result = []
    for selection in selections:
      for symbol_id in selection.view['relatedTypeIds']:
        if symbol_id not in seen:
          seen.add(symbol_id)
          result.append(self.symbols[symbol_id])
    return result
