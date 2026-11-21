"""Explicit pre-step publishing producer-prepared reference pages.

Run ``angular-api-docs-zensical generate-pages`` after producing the reference catalog. Site config
loading must never invoke this generation step.
"""

import json
from pathlib import Path
import re
from tempfile import TemporaryDirectory

from jinja2 import Environment, FileSystemLoader, StrictUndefined

from md_extension_element_api.adapter import ApiRenderError, safe_url
from md_extension_element_api.schema import SCHEMA_VERSION

from .settings import DEFAULT_PAGES_DIR, ElementDocsSettings


TEMPLATE_DIR = Path(__file__).parent / 'templates'


def safe_page_path(value, pages_dir=DEFAULT_PAGES_DIR):
  if (not isinstance(value, str) or not value.startswith(f'{pages_dir}/') or not value.endswith('.md')
      or re.search(r'[\x00-\x20\x7f\\?#:%]', value)
      or any(part in ('', '.', '..') for part in value.split('/'))):
    raise ApiRenderError(f'Invalid generated documentation path: {value!r}')
  return value


def read_prepared_json(path, label):
  """Read a prepared object with diagnostics that name the recovery command."""
  path = Path(path)
  try:
    source = path.read_bytes()
  except FileNotFoundError as error:
    raise ApiRenderError(f'Missing {label}: {path}. Run angular-api-docs extract.') from error
  try:
    value = json.loads(source)
  except (ValueError, UnicodeDecodeError) as error:
    raise ApiRenderError(f'Invalid {label} JSON: {path}. Run angular-api-docs extract. {error}') from error
  if not isinstance(value, dict):
    raise ApiRenderError(f'{label} must be a JSON object: {path}. Run angular-api-docs extract.')
  return source, value


def _invalid_catalog(message):
  raise ApiRenderError(f'Invalid reference catalog: {message}. Run angular-api-docs extract.')


def validate_reference_pages(references, pages_dir=DEFAULT_PAGES_DIR):
  """Check only the catalog envelope and paths used to publish generated files.

  Semantic validation belongs to the TypeScript producer; StrictUndefined checks
  fields consumed by templates when the explicit generation command renders them.
  """
  if not isinstance(references, dict) or not isinstance(references.get('pages'), list):
    _invalid_catalog('referencePages.pages must be a list')
  if not isinstance(references.get('navigation'), list):
    _invalid_catalog('referencePages.navigation must be a list')
  paths = set()
  for page in references['pages']:
    if not isinstance(page, dict):
      _invalid_catalog('each page must be an object')
    path = safe_page_path(page.get('path'), pages_dir)
    if path in paths:
      _invalid_catalog(f'duplicate page path {path!r}')
    paths.add(path)
  if f'{pages_dir}/index.md' not in paths:
    _invalid_catalog(f'pages must include {pages_dir}/index.md')
  folded_paths = {path.casefold() for path in paths}
  if len(folded_paths) != len(paths):
    _invalid_catalog('page paths must be unique on case-insensitive filesystems')
  for path in folded_paths:
    if any(parent.as_posix() in folded_paths for parent in Path(path).parents):
      _invalid_catalog(f'page path conflicts with a directory: {path!r}')
  return references


def load_reference_catalog(path, pages_dir=DEFAULT_PAGES_DIR):
  source, catalog = read_prepared_json(path, 'reference catalog')
  if catalog.get('schemaVersion') != SCHEMA_VERSION:
    raise ApiRenderError(f'Reference catalog must use schemaVersion {SCHEMA_VERSION}; run angular-api-docs extract.')
  return source, validate_reference_pages(catalog.get('referencePages'), pages_dir)


def render_reference_pages(references, pages_dir=DEFAULT_PAGES_DIR):
  validate_reference_pages(references, pages_dir)
  # Markdown prose must NOT be HTML-escaped. Explicit |e applies only to tag
  # attributes; README normalization and symbol heading semantics belong to TS.
  environment = Environment(loader=FileSystemLoader(TEMPLATE_DIR), autoescape=False,
    undefined=StrictUndefined, keep_trailing_newline=True)
  environment.globals['safe_url'] = safe_url
  return [{'path': page['path'], 'content': environment.get_template(
    page['kind'] + '.md.jinja').render(page=page)} for page in references['pages']]


def generate_reference_pages(settings: ElementDocsSettings):
  """Replace only the configured reference tree, rolling back failed publication."""
  _, references = load_reference_catalog(settings.catalog_path, settings.pages_dir)
  pages = render_reference_pages(references, settings.pages_dir)
  docs = settings.docs_dir
  if docs.is_symlink() or not docs.is_dir():
    raise ApiRenderError(f'Expected an authored docs directory, not a symlink: {docs}')
  target = docs
  for segment in settings.pages_dir.split('/'):
    target /= segment
    if target.is_symlink() or (target.exists() and not target.is_dir()):
      raise ApiRenderError(f'Refusing to publish through non-directory or symlink API output: {target}')
  target.parent.mkdir(parents=True, exist_ok=True)
  with TemporaryDirectory(prefix='.api-', dir=target.parent) as directory:
    temporary = Path(directory)
    generated = temporary / 'generated'
    generated.mkdir()
    for page in pages:
      file = generated / Path(page['path']).relative_to(settings.pages_dir)
      file.parent.mkdir(parents=True, exist_ok=True)
      file.write_text(page['content'], encoding='utf-8', newline='')
    previous = temporary / 'previous'
    moved = target.exists()
    if moved:
      target.rename(previous)
    try:
      generated.rename(target)
    except BaseException:
      if moved:
        previous.rename(target)
      raise
  return target
