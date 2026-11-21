"""Prepared API cache, configuration dependencies, and publication behavior."""
import json, os
from pathlib import Path

import pytest, zensical.config
from markdown import Markdown
from docs_fixtures import Html, fixture
from md_extension_element_api.adapter import ApiRenderError
from md_extension_element_api.renderer import load_renderer
from siemens_angular_api_docs_zensical.reference_pages import generate_reference_pages
from siemens_angular_api_docs_zensical.settings import load_settings


def prepare(settings, name):
  directory = settings.pages_dir
  pages = [{'kind': 'root', 'path': f'{directory}/index.md', 'title': 'API overview', 'readme': '', 'entries': [{'href': f'./{name}.md', 'name': name}]},
    {'kind': 'symbol', 'path': f'{directory}/{name}.md', 'title': f'{name} documentation', 'name': name, 'importPath': '@test/library', 'category': 'types'}]
  settings.catalog_path.write_text(json.dumps({'schemaVersion': 2, 'referencePages': {'navigation': [], 'pages': pages}}))


def test_renderer_cache_tracks_artifact_rewrites(tmp_path):
  with pytest.raises(ApiRenderError, match='Run angular-api-docs extract'): load_renderer(tmp_path / 'missing.json')
  artifact = tmp_path / 'api.json'
  artifact.write_text(json.dumps(fixture())); original = load_renderer(artifact)
  assert load_renderer(artifact) is original
  artifact.write_text(artifact.read_text() + ' ')
  updated = load_renderer(artifact)
  assert updated is not original
  assert load_renderer(artifact) is updated


def test_config_adds_navigation_and_watches_artifact_only_when_enabled(tmp_path, monkeypatch):
  monkeypatch.setattr(zensical.config, '_CONFIG', None)
  config_file = tmp_path / 'mkdocs.yml'
  config_file.write_text('''
site_name: Test Docs
nav:
  - Library: []
extra:
  element_docs_install: !!python/name:siemens_angular_api_docs_zensical.zensical_navigation.install
  element_docs:
    api:
      enabled: !ENV [TEST_DOCS_API, false]
      artifact_dir: prepared
      pages_dir: reference
      nav_parent: Library
      nav_title: Reference
''')
  (tmp_path / 'docs').mkdir()
  monkeypatch.delenv('TEST_DOCS_API', raising=False)
  disabled = zensical.config.parse_mkdocs_config(str(config_file))
  assert 'element_docs_install' not in disabled['extra']
  assert disabled['nav'][0]['children'] == []
  assert disabled['watched_files'] == []

  artifact = tmp_path / 'prepared/api-documentation.json'
  artifact.parent.mkdir()
  artifact.touch()
  artifact.with_name('api-reference-pages.json').write_text(json.dumps({
    'schemaVersion': 2, 'referencePages': {
      'navigation': [{'Overview': 'reference/index.md'}], 'pages': [{'path': 'reference/index.md'}],
    },
  }))

  monkeypatch.setenv('TEST_DOCS_API', 'true')
  config = zensical.config.parse_mkdocs_config(str(config_file))
  reference, = config['nav'][0]['children']
  assert reference['title'] == 'Reference'
  assert [page['url'] for page in reference['children']] == ['reference/index.md']
  before = config['watched_files']
  assert str(artifact) in [path for path, _ in before]
  os.utime(artifact, (artifact.stat().st_atime, artifact.stat().st_mtime + 2))
  assert zensical.config.parse_mkdocs_config(str(config_file))['watched_files'] != before


def published_tree(root):
  settings = load_settings({'root_dir': root, 'docs_dir': 'handbook', 'extra': {'element_docs': {
    'api': {'artifact_dir': 'prepared', 'pages_dir': 'developer/reference'},
  }}})
  settings.docs_dir.mkdir()
  settings.artifact_dir.mkdir()
  prepare(settings, 'Config')
  return generate_reference_pages(settings), settings


def test_publication_replaces_only_api_and_removes_stale_pages(tmp_path):
  api, settings = published_tree(tmp_path)
  assert api == tmp_path / 'handbook/developer/reference'
  guide = tmp_path / 'handbook/developer/guide.md'; guide.write_text('# Authored guide\n')
  prepare(settings, 'Options'); generate_reference_pages(settings)
  assert not (api / 'Config.md').exists()
  assert Html(Markdown().convert((api / 'index.md').read_text())).links == ['./Options.md']
  assert '# Options documentation' in (api / 'Options.md').read_text()
  assert guide.read_text() == '# Authored guide\n'


def test_failed_publication_restores_previous_api_tree(tmp_path, monkeypatch):
  api, settings = published_tree(tmp_path)
  before = {path.name: path.read_bytes() for path in api.iterdir()}
  prepare(settings, 'Options')
  rename = Path.rename

  def fail_publication(path, target):
    if target == api and (path / 'Options.md').is_file(): raise OSError('injected publication failure')
    return rename(path, target)
  monkeypatch.setattr(Path, 'rename', fail_publication)
  with pytest.raises(OSError, match='injected publication failure'): generate_reference_pages(settings)
  assert {path.name: path.read_bytes() for path in api.iterdir()} == before


def test_publication_does_not_follow_symlink_in_nested_pages_dir(tmp_path):
  api, settings = published_tree(tmp_path)
  outside = tmp_path / 'outside'
  api.parent.rename(outside)
  api.parent.symlink_to(outside, target_is_directory=True)
  prepare(settings, 'Options')

  with pytest.raises(ApiRenderError, match='symlink API output'):
    generate_reference_pages(settings)

  assert (outside / 'reference/Config.md').is_file()
  assert not (outside / 'reference/Options.md').exists()
