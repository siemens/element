"""Preparation uses only portable JSON, real snippets and tagged Markdown."""

from copy import deepcopy
import importlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
from tempfile import TemporaryDirectory
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch
from markdown import Markdown
import yaml

from test_api_renderer import fixture, symbol
from md_extension_element_api.adapter import ApiRenderError
from md_extension_element_api.extension import ElementApiExtension, parse_requests
from mkdocs_element_docs_builder import preparation
from mkdocs_element_docs_builder.reference_pages import (
  TEMPLATE_DIR, render_reference_pages,
)

with patch.dict(os.environ, {'DOCS_COMPOSER': 'false'}):
  plugin = importlib.import_module('mkdocs_element_docs_builder.plugin')


def artifacts():
  data = fixture()
  pages = []
  for item in data['symbols']:
    category = 'components' if item['id'] == 'widget' else 'types'
    item['referencePath'] = f'api/test/library/{category}/{item["name"]}.md'
    pages.append({'kind': 'symbol', 'path': item['referencePath'],
      'title': item['name'] + (' Component documentation' if category == 'components' else ' Type documentation'),
      'name': item['name'], 'importPath': item['importPath'], 'category': category})
  pages.extend([
    {'kind': 'category', 'path': 'api/test/library/components/index.md',
      'title': 'Components in @test/library', 'groups': [{'letter': '', 'entries': [
        {'name': 'Widget', 'path': 'api/test/library/components/Widget.md', 'label': 'Widget', 'href': './Widget.md'},
      ]}]},
    {'kind': 'category', 'path': 'api/test/library/types/index.md',
      'title': 'Types in @test/library', 'groups': [
        {'letter': 'C', 'entries': [
          {'name': 'Config', 'path': 'api/test/library/types/Config.md', 'label': 'Config', 'href': './Config.md'},
        ]},
        {'letter': 'O', 'entries': [
          {'name': 'Other', 'path': 'api/test/library/types/Other.md', 'label': 'Other', 'href': './Other.md'},
        ]},
      ]},
  ])
  pages.append({'kind': 'package', 'path': 'api/test/library/index.md', 'title': '@test/library',
    'entries': [{'name': category.capitalize(), 'path': f'api/test/library/{category}/index.md',
      'label': category.capitalize(), 'href': f'./{category}/index.md'}
      for category in ('components', 'types')], 'readme': '## Package guide\n\nProse & [source](https://example.com).\n'})
  pages.append({'kind': 'root', 'path': 'api/index.md', 'title': 'Documented packages',
    'entries': [{'name': '@test/library', 'path': 'api/test/library/index.md', 'label': '@test/library',
      'href': './test/library/index.md'}],
    'readme': '## Root guide\n\n`<literal>` and prose & punctuation&#58; preserved.\n'})
  return data, {'schemaVersion': 2, 'referencePages': {
    'pages': pages,
    'navigation': [
      {'Overview': 'api/index.md'}, {'@test/library': [
        {'Overview': 'api/test/library/index.md'},
        {'Components': [{'Overview': 'api/test/library/components/index.md'},
          {'Widget': 'api/test/library/components/Widget.md'}]},
        {'Types': [{'Overview': 'api/test/library/types/index.md'},
          {'Config': 'api/test/library/types/Config.md'}, {'Other': 'api/test/library/types/Other.md'}]},
      ]},
    ],
  }}


class PreparationTests(unittest.TestCase):
  def setUp(self):
    self.temporary = TemporaryDirectory()
    self.addCleanup(self.temporary.cleanup)
    self.root = Path(self.temporary.name).resolve()
    self.data, self.catalog = artifacts()
    self.artifact = self.root / 'dist/element-docs/api-documentation.json'
    self.write('docs/components/example.md', '# Example\n\n<si-docs-api name="Widget"/>\n')
    self.write('docs/api/legacy.md', 'Legacy source MUST NOT change\n')
    self.write('mkdocs.yml', 'site_name: Test\n')
    self.save_artifacts()
    self.environment = patch.dict(os.environ, {'DOCS_COMPOSER': 'false',
      'PATH': os.environ.get('PATH', ''), 'HOME': os.environ.get('HOME', '')}, clear=True)
    self.environment.start()
    self.addCleanup(self.environment.stop)

  def write(self, path, content):
    target = self.root / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content, encoding='utf-8', newline='')
    return target

  def save_artifacts(self):
    self.write('dist/element-docs/api-documentation.json', json.dumps(self.data))
    self.write('dist/element-docs/api-reference-pages.json', json.dumps(self.catalog))

  def prepare(self):
    return preparation.prepare_documentation(self.root)

  def test_reference_markdown_preserves_tags_search_annotations_and_complete_types(self):
    prepared = self.prepare()
    staged = Path(prepared['docs_dir'])
    widget = (staged / self.data['symbols'][0]['referencePath']).read_text()
    self.assertIn('search:\n  boost: 0.25', widget)
    self.assertIn('# Widget Component documentation', widget)
    self.assertEqual([request['mode'] for request in parse_requests(widget)], ['api', 'types'])
    config = (staged / 'api/test/library/types/Config.md').read_text()
    self.assertIn('## TypeScript declaration', config)
    self.assertEqual([request['mode'] for request in parse_requests(config)], ['type', 'types'])
    self.assertNotIn('si-docs-api no-copy', widget)
    for path in ('api/index.md', 'api/test/library/types/index.md'):
      self.assertIn('search:\n  exclude: true', (staged / path).read_text())
    self.assertNotIn('## W', (staged / 'api/test/library/components/index.md').read_text())
    self.assertIn('## C\n', (staged / 'api/test/library/types/index.md').read_text())
    self.assertIn('## O\n', (staged / 'api/test/library/types/index.md').read_text())
    self.assertIn('- [Config](./Config.md)', (staged / 'api/test/library/types/index.md').read_text())
    self.assertIn(self.catalog['referencePages']['pages'][-1]['readme'], (staged / 'api/index.md').read_text())
    self.assertFalse((staged / 'api/legacy.md').exists())
    self.assertEqual((self.root / 'docs/api/legacy.md').read_text(), 'Legacy source MUST NOT change\n')
    self.assertFalse((self.root / '.element-docs-api.generated.yml').exists())

  def test_navigation_order_uses_descriptors_not_symbol_sorting(self):
    nav = self.prepare()['extra']['element_api_nav']
    self.assertEqual(nav, [
      {'Overview': 'api/index.md'}, {'@test/library': [
        {'Overview': 'api/test/library/index.md'},
        {'Components': [{'Overview': 'api/test/library/components/index.md'},
          {'Widget': 'api/test/library/components/Widget.md'}]},
        {'Types': [{'Overview': 'api/test/library/types/index.md'},
          {'Config': 'api/test/library/types/Config.md'}, {'Other': 'api/test/library/types/Other.md'}]},
      ]},
    ])

  def test_type_reference_headings_do_not_skip_a_level(self):
    prepared = self.prepare()
    page = 'api/test/library/types/Config.md'
    source = (Path(prepared['docs_dir']) / page).read_text().split('---\n\n', 1)[1]
    md = Markdown(extensions=[ElementApiExtension(artifact_path=self.artifact, artifact_revision='test')])
    context = Mock(page=SimpleNamespace(path=page), run=lambda lines: lines)
    md.preprocessors.register(context, 'rendering_context', 100)

    html = md.convert(source)
    levels = [int(level) for level in re.findall(r'<h([1-6])\b', html)]

    self.assertEqual(levels[:3], [1, 2, 3])
    self.assertTrue(all(current <= previous + 1 for previous, current in zip(levels, levels[1:])))

  def test_navigation_uses_labels_at_root_and_package_levels_too(self):
    references = deepcopy(self.catalog['referencePages'])
    root = references['pages'][-1]
    package = references['pages'][-2]
    root['entries'][0]['label'] = 'Package navigation label'
    package['entries'][0]['label'] = 'Category navigation label'
    references['navigation'][1] = {'Package navigation label': [
      {'Overview': package['path']},
      {'Category navigation label': references['navigation'][1]['@test/library'][1]['Components']},
      {'Types': references['navigation'][1]['@test/library'][2]['Types']},
    ]}
    self.catalog['referencePages'] = references
    self.save_artifacts()
    nav = self.prepare()['extra']['element_api_nav']
    self.assertEqual(list(nav[1]), ['Package navigation label'])
    self.assertEqual(list(nav[1]['Package navigation label'][1]), ['Category navigation label'])
    rendered = {page['path']: page['content'] for page in render_reference_pages(references)}
    self.assertIn('- [@test/library]', rendered['docs/api/index.md'])
    self.assertIn('- [Components]', rendered['docs/api/test/library/index.md'])
    self.assertNotIn('navigation label', rendered['docs/api/index.md'])

  def test_duplicate_alias_navigation_uses_compiler_labels_not_paths_or_imports(self):
    references = deepcopy(self.catalog['referencePages'])
    category = next(page for page in references['pages'] if page['kind'] == 'category' and 'components/' in page['path'])
    primary = references['pages'][0]
    primary['path'] = 'api/test/library/components/_entrypoints/primary/Widget.md'
    secondary = {**primary, 'path': 'api/test/library/components/_entrypoints/feature/Widget.md', 'importPath': '@test/library/feature'}
    references['pages'].append(secondary)
    self.data['symbols'][0]['referencePath'] = primary['path']
    secondary_id = '@test/library/feature#Widget'
    self.data['symbols'].append(symbol(secondary_id, 'Widget', kind='component',
      importPath=secondary['importPath'], referencePath=secondary['path']))
    self.data['index'][secondary_id] = [secondary_id]
    self.data['targets'][secondary_id] = {'symbolId': secondary_id, 'anchor': 'stable-secondary-widget'}
    category['groups'] = [{'letter': '', 'entries': [
      {'name': 'Widget', 'path': primary['path'], 'label': 'Widget (primary)', 'href': './_entrypoints/primary/Widget.md'},
      {'name': 'Widget', 'path': secondary['path'], 'label': 'Widget (formly)', 'href': './_entrypoints/feature/Widget.md'},
    ]}]
    references['navigation'][1]['@test/library'][1]['Components'] = [
      {'Overview': category['path']}, {'Widget (primary)': primary['path']}, {'Widget (formly)': secondary['path']},
    ]
    self.catalog['referencePages'] = references
    self.save_artifacts()
    group = self.prepare()['extra']['element_api_nav'][1]['@test/library'][1]['Components']
    self.assertEqual(list(group[1]), ['Widget (primary)'])
    self.assertEqual(list(group[2]), ['Widget (formly)'])
    rendered = {page['path']: page['content'] for page in render_reference_pages(references)}
    self.assertIn('- [Widget](./_entrypoints/feature/Widget.md)', rendered['docs/' + category['path']])

  def test_templates_escape_only_html_attributes_not_markdown_prose(self):
    references = deepcopy(self.catalog['referencePages'])
    page = references['pages'][0]
    page['name'] = 'Name"<&'
    page['importPath'] = '@test/library/"<&'
    page['title'] = 'Title <prose> & text'
    rendered = render_reference_pages(references)[0]['content']
    self.assertIn('# Title <prose> & text', rendered)
    self.assertIn('name', rendered)
    requests = parse_requests(rendered)
    self.assertEqual(requests[0]['name'], page['name'])
    self.assertEqual(requests[0]['package'], page['importPath'])
    self.assertIn('&#34;&lt;&amp;', rendered)

  def test_stage_keeps_expanded_authored_sources_and_final_newlines(self):
    self.write('snippet.md', 'snippet & text\n')
    self.write('docs/example.md', '--8<-- "snippet.md"\n\n')
    self.write('docs/crlf.md', 'original\r\nnext\r\n\r\n')
    self.write('README.md', '# Symlink readme\n\n')
    (self.root / 'docs/README.md').symlink_to('../README.md')
    asset = self.write('shared/assets/image.svg', '<svg/>')
    (self.root / 'docs/assets').symlink_to('../shared/assets', target_is_directory=True)
    prepared = self.prepare()
    staged = Path(prepared['docs_dir'])
    self.assertEqual((staged / 'example.md').read_bytes(), b'snippet & text\n\n\n')
    self.assertEqual((staged / 'README.md').read_bytes(), b'# Symlink readme\n\n')
    self.assertFalse((self.artifact.parent / 'original-sources.json').exists())
    self.assertFalse((staged / 'README.md').is_symlink())
    self.assertFalse((staged / 'assets').is_symlink())
    self.assertEqual((staged / 'assets/image.svg').read_bytes(), asset.read_bytes())
    self.assertEqual((staged / 'crlf.md').read_bytes(), b'original\r\nnext\r\n\r\n')

  def test_snippets_expand_once_in_preparation_and_not_again_in_markdown(self):
    self.write('snippet.md', 'Snippet once\n')
    self.write('docs/components/example.md', '--8<-- "snippet.md"\n')
    config = {'markdown_extensions': [{'pymdownx.snippets': {
      'base_path': ['.', 'node_modules/@siemens-ux/design-tokens/docs']}}]}
    with patch.dict(os.environ, {'ELEMENT_DOCS_API': 'true'}):
      preparation.prepare_config(config, self.root / 'mkdocs.yml')
      plugin.apply_staged_markdown(config)
    staged = self.root / config['docs_dir'] / 'components/example.md'
    self.assertEqual(staged.read_text().count('Snippet once'), 1)
    self.assertNotIn('pymdownx.snippets', str(config['markdown_extensions']))

  def test_snippet_io_failure_keeps_previous_tree(self):
    prepared = self.prepare()
    before = {file.relative_to(Path(prepared['docs_dir'])).as_posix(): file.read_bytes()
      for file in Path(prepared['docs_dir']).rglob('*') if file.is_file()}
    with patch('pymdownx.snippets.SnippetPreprocessor.run', side_effect=OSError('unreadable snippet')), self.assertRaisesRegex(ValueError, 'unreadable snippet'):
      self.prepare()
    after = {file.relative_to(Path(prepared['docs_dir'])).as_posix(): file.read_bytes()
      for file in Path(prepared['docs_dir']).rglob('*') if file.is_file()}
    self.assertEqual(before, after)
    self.assertEqual(list(self.artifact.parent.glob('.stage-*')), [])

  def test_invalid_tags_fail_before_publication_without_html_rendering(self):
    prepared = self.prepare()
    before = (Path(prepared['docs_dir']) / 'components/example.md').read_bytes()
    self.write('docs/components/example.md', '<si-docs-type name="Unknown"/>')
    with patch('md_extension_element_api.renderer.ApiRenderer.prepare_page', side_effect=AssertionError('HTML during prepare')):
      with self.assertRaisesRegex(ApiRenderError, 'Unknown'):
        self.prepare()
    self.assertEqual((Path(prepared['docs_dir']) / 'components/example.md').read_bytes(), before)

  def test_successful_restage_removes_deleted_sources_and_assets(self):
    self.write('docs/stale.md', 'stale')
    self.write('docs/stale.svg', '<svg/>')
    prepared = self.prepare()
    (self.root / 'docs/stale.md').unlink()
    (self.root / 'docs/stale.svg').unlink()
    self.prepare()
    self.assertFalse((Path(prepared['docs_dir']) / 'stale.md').exists())
    self.assertFalse((Path(prepared['docs_dir']) / 'stale.svg').exists())

  def test_revision_includes_catalog_python_and_page_templates(self):
    builder = self.root / 'builder'
    for name in preparation.RENDERER_PACKAGES:
      self.write(f'builder/{name}/__init__.py', '# package')
    self.write('builder/mkdocs_element_docs_builder/preparation.py', '# preparation')
    template = self.write('builder/mkdocs_element_docs_builder/templates/root.md.jinja', '# template')
    self.write('builder/mkdocs_element_docs_builder/__pycache__/ignored.py', '# ignored')
    def revision(artifact=b'json', catalog=b'catalog'):
      with patch.object(preparation, 'find_spec', side_effect=lambda name: SimpleNamespace(origin=str(builder / name / '__init__.py'))):
        return preparation.presentation_revision(artifact, catalog)
    first = revision()
    self.assertNotEqual(first, revision(b'changed'))
    self.assertNotEqual(first, revision(catalog=b'changed'))
    template.write_text('# changed')
    self.assertNotEqual(first, revision())
    template.write_text('# template')
    self.assertEqual(first, revision())
    self.write('builder/mkdocs_element_docs_builder/preparation.py', '# new python')
    self.assertNotEqual(first, revision())

  def test_template_changes_invalidate_prepared_revision_and_rendering(self):
    builder = self.root / 'builder'
    for name in preparation.RENDERER_PACKAGES:
      self.write(f'builder/{name}/__init__.py', '# package')
    templates = builder / 'mkdocs_element_docs_builder/templates'
    templates.mkdir(parents=True)
    for template in TEMPLATE_DIR.iterdir():
      self.write('builder/mkdocs_element_docs_builder/templates/' + template.name, template.read_text())
    with patch('mkdocs_element_docs_builder.reference_pages.TEMPLATE_DIR', templates), patch.object(preparation, 'find_spec', side_effect=lambda name: SimpleNamespace(origin=str(builder / name / '__init__.py'))):
      first = self.prepare()['extra']['element_docs_api_revision']
      self.write('builder/mkdocs_element_docs_builder/templates/root.md.jinja', '# changed root template\n')
      prepared = self.prepare()
    self.assertEqual((Path(prepared['docs_dir']) / 'api/index.md').read_text(), '# changed root template\n')
    self.assertNotEqual(first, prepared['extra']['element_docs_api_revision'])

  def test_installed_fingerprint_ignores_unrelated_packages_and_matches_editable(self):
    editable = self.root / 'editable'
    installed = self.root / 'site-packages'
    for name in preparation.RENDERER_PACKAGES:
      self.write(f'editable/{name}/__init__.py', '# package')
      self.write(f'editable/{name}/renderer.py', '# owned Python')
      self.write(f'editable/{name}/templates/page.jinja', '# owned template')
    shutil.copytree(editable, installed)
    def spec(name):
      self.assertIn(name, preparation.RENDERER_PACKAGES)
      if name == 'md_extension_element_docs':
        return SimpleNamespace(origin=None, submodule_search_locations=[str(installed / name)])
      return SimpleNamespace(origin=str(installed / name / '__init__.py'))
    with patch.object(preparation, 'find_spec', side_effect=spec):
      first = preparation.presentation_revision(b'json', b'catalog')
      with patch.object(preparation, 'find_spec', side_effect=lambda name: SimpleNamespace(origin=str(editable / name / '__init__.py'))):
        self.assertEqual(first, preparation.presentation_revision(b'json', b'catalog'))
      self.write('site-packages/unrelated/large.py', '# unrelated')
      self.write('site-packages/unrelated/templates/page.jinja', '# unrelated template')
      self.assertEqual(first, preparation.presentation_revision(b'json', b'catalog'))
      self.write('site-packages/unrelated/large.py', '# unrelated edit')
      self.assertEqual(first, preparation.presentation_revision(b'json', b'catalog'))
      self.write('site-packages/md_extension_element_api/renderer.py', '# owned edit')
      self.assertNotEqual(first, preparation.presentation_revision(b'json', b'catalog'))
      self.write('site-packages/md_extension_element_api/renderer.py', '# owned Python')
      self.assertEqual(first, preparation.presentation_revision(b'json', b'catalog'))
      self.write('site-packages/mkdocs_element_docs_builder/templates/page.jinja', '# changed template')
      self.assertNotEqual(first, preparation.presentation_revision(b'json', b'catalog'))

  def test_real_workspace_fingerprint_supports_namespace_packages(self):
    javascript = sys.modules.get('javascript')
    actual = preparation.presentation_revision(b'json', b'catalog')
    self.assertEqual(actual, preparation.presentation_revision(b'json', b'catalog'))
    self.assertEqual(len(actual), 64)
    self.assertIs(sys.modules.get('javascript'), javascript)

  def test_publication_failure_restores_previous_tree(self):
    prepared = self.prepare()
    source = (Path(prepared['docs_dir']) / 'components/example.md').read_bytes()
    self.write('docs/components/example.md', '# New source\n')
    rename = Path.rename
    def fail_publication(path, target):
      if path.name == 'docs' and path.parent.name.startswith('.stage-'):
        raise OSError('injected publication failure')
      return rename(path, target)
    with patch.object(Path, 'rename', fail_publication):
      with self.assertRaisesRegex(OSError, 'injected publication'):
        self.prepare()
    self.assertEqual((Path(prepared['docs_dir']) / 'components/example.md').read_bytes(), source)
    self.assertEqual(list(self.artifact.parent.glob('.stage-*')), [])

  def test_config_activation_sets_explicit_inputs_without_exporting_environment(self):
    config = {'nav': [{'Components': [{'Old': 'components/example.md'}]}]}
    with patch.dict(os.environ, {'ELEMENT_DOCS_API': 'true'}):
      before = dict(os.environ)
      self.assertTrue(preparation.prepare_config(config, self.root / 'mkdocs.yml'))
      self.assertEqual(dict(os.environ), before)
    self.assertEqual(config['docs_dir'], 'dist/element-docs/docs')
    self.assertEqual(config['extra']['element_docs_api_json'], str(self.artifact))
    self.assertEqual(config['extra']['element_docs_root'], str(self.root))
    self.assertEqual(len(config['extra']['element_docs_api_revision']), 64)

  def test_nonapi_preparation_does_not_touch_config_or_environment(self):
    config = {'docs_dir': 'docs', 'extra': {'unrelated': True}, 'nav': []}
    before = deepcopy(config)
    environment = dict(os.environ)
    with patch.object(preparation, 'prepare_documentation', side_effect=AssertionError('must not prepare')):
      self.assertFalse(preparation.prepare_config(config, self.root / 'mkdocs.yml'))
    self.assertEqual(config, before)
    self.assertEqual(dict(os.environ), environment)

  def test_api_activation_requires_the_exact_true_script_value(self):
    for value in ('false', 'TRUE', '1', 'yes', ''):
      config = {'docs_dir': 'docs'}
      with self.subTest(value=value), patch.dict(os.environ, {'ELEMENT_DOCS_API': value}), \
        patch.object(preparation, 'prepare_documentation', side_effect=AssertionError('must not prepare')):
        self.assertFalse(preparation.prepare_config(config, self.root / 'mkdocs.yml'))
      self.assertEqual(config, {'docs_dir': 'docs'})

  def test_catalog_path_validation_rejects_traversal_and_noncanonical_forms(self):
    for path in ('../outside.md', '/api/a.md', 'api/../a.md', 'api/./a.md', 'api//a.md',
        'api\\a.md', 'api/a.txt', 'api/%2e%2e/a.md', 'api/a.md#fragment', 'api/C:/a.md', 'api/a\x00.md'):
      with self.subTest(path=path):
        catalog = deepcopy(self.catalog)
        catalog['referencePages']['pages'][0]['path'] = path
        with self.assertRaisesRegex(ApiRenderError, 'Invalid generated documentation path'):
          render_reference_pages(catalog['referencePages'])

  def test_catalog_version_is_checked_at_loading(self):
    self.catalog['schemaVersion'] = 1
    self.save_artifacts()
    with self.assertRaisesRegex(ApiRenderError, 'Reference catalog must use schemaVersion 2'):
      self.prepare()

  def test_reference_markdown_links_reject_unsafe_urls(self):
    references = deepcopy(self.catalog['referencePages'])
    for entry in (references['pages'][3]['groups'][0]['entries'][0],
        references['pages'][-2]['entries'][0], references['pages'][-1]['entries'][0]):
      entry['href'] = 'javascript:alert(1)'
      with self.assertRaisesRegex(ApiRenderError, 'Unsafe'):
        render_reference_pages(references)
      entry['href'] = './index.md'

  def test_native_hook_prepares_before_defaults_discover_pages(self):
    import mkdocs_element_docs_builder.compat_zensical as compat
    class StopDiscovery(Exception):
      pass
    config = {'docs_dir': 'docs',
      'nav': [{'Components': []}], 'markdown_extensions': [{'pymdownx.snippets': {'base_path': ['.']}}]}
    def defaults(value, path):
      self.assertEqual(value['docs_dir'], 'dist/element-docs/docs')
      self.assertTrue((self.root / value['docs_dir'] / 'api/index.md').is_file())
      self.assertIn('element_api_nav', value['extra'])
      self.assertEqual(value['nav'][0]['Components'][0]['API'][0], {'Overview': 'api/index.md'})
      self.assertNotIn('pymdownx.snippets', value['markdown_extensions'])
      raise StopDiscovery()
    with patch.object(compat, '_apply_defaults', side_effect=defaults), patch.dict(os.environ, {'ELEMENT_DOCS_API': 'true'}):
      with self.assertRaises(StopDiscovery):
        compat.zensical_config._apply_defaults(config, str(self.root / 'mkdocs.yml'))

  def test_failed_native_preparation_clears_previous_finalization(self):
    import mkdocs_element_docs_builder.compat_zensical as compat
    finalize = Mock()
    def defaults(config, path):
      raise AssertionError('defaults after failure')
    config = {}
    with patch.object(compat, '_apply_defaults', side_effect=defaults), patch.object(compat, '_POST_BUILD', finalize), patch.object(compat, '_COMPOSER_EXTENSION', Mock()), patch.object(compat, 'prepare_config', side_effect=ValueError('invalid artifact')):
      with self.assertRaisesRegex(ValueError, 'invalid artifact'):
        compat.zensical_config._apply_defaults(config, str(self.root / 'mkdocs.yml'))
      self.assertIsNone(compat._POST_BUILD)
      self.assertIsNone(compat._COMPOSER_EXTENSION)
      compat._run_post_build()
    finalize.assert_not_called()

  def test_native_builder_configuration_does_not_repeat_predefault_preparation(self):
    config = {'extra_css': [], 'extra_javascript': [], 'extra': {}, 'markdown_extensions': []}
    with patch.object(preparation, 'prepare_documentation', side_effect=AssertionError('repeat staging')), patch.object(plugin, 'api_enabled', False):
      plugin.configure(config)

  def test_activation_with_missing_or_wrong_schema_artifacts_fails_hard(self):
    config = {'docs_dir': 'docs'}
    for missing in (True, False):
      if missing:
        self.artifact.unlink()
      else:
        self.write('dist/element-docs/api-documentation.json', '{"schemaVersion":1}')
      with self.subTest(missing=missing), patch.dict(os.environ, {'ELEMENT_DOCS_API': 'true'}):
        with self.assertRaises((FileNotFoundError, ApiRenderError)):
          preparation.prepare_config(config, self.root / 'mkdocs.yml')
    self.assertEqual(config, {'docs_dir': 'docs'})

  def test_predefault_preparation_preserves_authored_navigation(self):
    config = {
      'nav': [{'Components': [{'Example': 'components/example.md'}, {'API': [{'Old': 'api/old.md'}]}]}]}
    with patch.dict(os.environ, {'ELEMENT_DOCS_API': 'true'}):
      preparation.prepare_config(config, self.root / 'mkdocs.yml')
      plugin.apply_staged_navigation(config)
    self.assertEqual(config['nav'][0]['Components'][0], {'Example': 'components/example.md'})
    self.assertEqual(config['nav'][0]['Components'][1]['API'], config['extra']['element_api_nav'])
    self.assertTrue((self.root / config['docs_dir'] / 'api/index.md').is_file())

  def test_real_native_build_discovers_generated_pages_from_root_config(self):
    config = {'site_name': 'Prepared integration', 'docs_dir': 'docs', 'site_dir': 'site',
      'nav': [{'Components': [{'Example': 'components/example.md'}]}],
      'markdown_extensions': [{'pymdownx.snippets': {'base_path': ['.', 'node_modules/@siemens-ux/design-tokens/docs']}}]}
    source = yaml.safe_dump(config, sort_keys=False) + (
      'extra:\n  element_docs_builder_zensical: !!python/name:mkdocs_element_docs_builder.compat_zensical.compat\n')
    self.write('mkdocs.yml', source)
    repository = Path(__file__).resolve().parents[3]
    result = subprocess.run(['uv', 'run', 'zensical', 'build', '--strict', '--config-file', str(self.root / 'mkdocs.yml')],
      cwd=repository, env={**os.environ, 'DOCS_COMPOSER': 'false', 'ELEMENT_DOCS_API': 'true'},
      capture_output=True, text=True, timeout=90)
    self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
    self.assertTrue((self.root / 'site/api/test/library/types/Config/index.html').is_file())
    self.assertIn('Prepared signal input.', (self.root / 'site/components/example/index.html').read_text())
    self.assertEqual((self.root / 'mkdocs.yml').read_text(), source)


if __name__ == '__main__':
  unittest.main()
