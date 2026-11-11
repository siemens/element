"""Plugin-owned Markdown preparation, before Zensical defaults/page discovery.

Only ELEMENT_DOCS_API=true activates this pass. Native serve watches the staged
tree normally; source Markdown edits require a config reload/server restart.
Extraction, API HTML rendering and Composer's original docs/api are independent.
"""

import hashlib
from importlib.util import find_spec
import json
import os
from pathlib import Path
import shutil
from tempfile import TemporaryDirectory

from md_extension_element_api.validate import validate_pages
from md_extension_element_api.adapter import ApiRenderError

from .reference_pages import render_reference_pages
from .stage_snippets import expand_files


RENDERER_PACKAGES = (
  'md_extension_element_docs', 'md_extension_element_docs_composer',
  'md_extension_element_api', 'mkdocs_element_docs_builder',
)


def presentation_revision(artifact, catalog):
  """Hash only our packages, identically in editable and ordinary wheel installs.

  Looking up top-level specs locates packages without importing the optional
  Composer/JavaScript bridge. Never traverse their shared site-packages parent.
  """
  digest = hashlib.sha256()
  digest.update(artifact)
  digest.update(catalog)
  for name in sorted(RENDERER_PACKAGES):
    spec = find_spec(name)
    if spec is None:
      raise ModuleNotFoundError(f'Cannot locate documentation renderer package: {name}')
    if spec.origin is not None:
      package = Path(spec.origin).resolve().parent
    elif spec.submodule_search_locations:
      # md_extension_element_docs is a namespace package (no __init__.py).
      package = Path(next(iter(spec.submodule_search_locations))).resolve()
    else:
      raise ModuleNotFoundError(f'Cannot locate documentation renderer package: {name}')
    if not package.is_dir():
      raise FileNotFoundError(f'Missing documentation renderer package: {package}')
    for file in sorted(package.rglob('*')):
      if file.is_file() and file.suffix in ('.py', '.jinja') and '__pycache__' not in file.parts:
        digest.update((name + '/' + file.relative_to(package).as_posix()).encode())
        digest.update(file.read_bytes())
  return digest.hexdigest()


def _publish(temporary, output):
  """Publish the scoped staged tree, restoring it on publication failure."""
  target = output / 'docs'
  previous = temporary / 'previous'
  moved = target.exists() or target.is_symlink()
  if moved:
    target.rename(previous)
  try:
    (temporary / 'docs').rename(target)
  except BaseException:
    if moved:
      previous.rename(target)
    raise


def prepare_documentation(root_dir):
  root = Path(root_dir).resolve()
  artifact = root / 'dist/element-docs/api-documentation.json'
  catalog = artifact.with_name('api-reference-pages.json')
  artifact_source, catalog_source = artifact.read_bytes(), catalog.read_bytes()
  presentation = json.loads(artifact_source)
  reference_catalog = json.loads(catalog_source)
  if reference_catalog.get('schemaVersion') != 2:
    raise ApiRenderError('Reference catalog must use schemaVersion 2; regenerate it with tools/api-docs.')
  references = reference_catalog['referencePages']
  revision = presentation_revision(artifact_source, catalog_source)
  output = root / 'dist/element-docs'
  output.mkdir(parents=True, exist_ok=True)
  with TemporaryDirectory(prefix='.stage-', dir=output) as directory:
    temporary = Path(directory)
    docs = temporary / 'docs'
    # Dereference files AND asset directories; cached relative symlinks otherwise
    # point at the wrong root. Leave legacy generated docs/api completely alone.
    shutil.copytree(root / 'docs', docs, symlinks=False,
      ignore=lambda directory, names: ['api'] if Path(directory) == root / 'docs' and 'api' in names else [])
    sources = []
    for file in sorted(docs.rglob('*.md')):
      if file.is_file():
        with file.open(encoding='utf-8', newline='') as stream:
          sources.append({'path': 'docs/' + file.relative_to(docs).as_posix(), 'content': stream.read()})
    sources.extend(render_reference_pages(references))
    expanded = expand_files(root, sources)
    validate_pages(presentation, expanded)
    for file in expanded:
      target = docs / file['path'][len('docs/'):]
      target.parent.mkdir(parents=True, exist_ok=True)
      target.write_text(file['content'], encoding='utf-8', newline='')
    _publish(temporary, output)
  return {
    'docs_dir': str(output / 'docs'),
    'extra': {
      'element_docs_root': str(root),
      'element_docs_api_json': str(artifact),
      'element_docs_api_revision': revision,
      'element_api_nav': references['navigation'],
    },
  }


def prepare_config(config, config_path):
  """Prepare once before native defaults and page discovery."""
  if os.environ.get('ELEMENT_DOCS_API') != 'true':
    return False
  root = Path(config_path).resolve().parent
  prepared = prepare_documentation(root)
  # Native zrx identities require relative docs_dir, including during serve.
  config['docs_dir'] = os.path.relpath(prepared['docs_dir'], root)
  config.setdefault('extra', {}).update(prepared['extra'])
  return True
