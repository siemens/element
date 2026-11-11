"""Native-linker and artifact-cache regressions using a minimal real docs build."""
from copy import deepcopy
import json
import os
from pathlib import Path
import subprocess
from tempfile import TemporaryDirectory
import unittest

from test_api_renderer import Html, fixture, paragraph, text
from test_preparation import artifacts
from mkdocs_element_docs_builder.reference_pages import render_reference_pages


class ApiZensicalTests(unittest.TestCase):
  def test_native_links_and_json_only_changes_use_the_published_target(self):
    repository = Path(__file__).resolve().parents[3]
    with TemporaryDirectory() as directory:
      root = Path(directory)
      (root / 'docs/components').mkdir(parents=True)
      (root / 'docs/api/test').mkdir(parents=True)
      (root / 'docs/components/example.md').write_text('# Example\n\n<si-docs-api name="Widget" />\n')
      (root / 'docs/api/test/Config.md').write_text('# Config\n\n<si-docs-type name="Config" />\n')
      _, catalog = artifacts()
      widget_page = next(page for page in render_reference_pages(catalog['referencePages'])
                         if page['path'].endswith('/Widget.md'))
      widget_source = root / widget_page['path']
      widget_source.parent.mkdir(parents=True)
      widget_source.write_text(widget_page['content'])
      data = fixture()
      # Keep this fixture small; unpublished related targets are
      # intentionally plain text rather than links to nonexistent references.
      data['symbols'][0]['referencePath'] = None
      data['symbols'][2]['referencePath'] = None
      artifact = root / 'api.json'
      artifact.write_text(json.dumps(data))
      config = {
        'site_name': 'API integration', 'docs_dir': 'docs', 'site_dir': 'site',
        'markdown_extensions': [{'md_extension_element_api.extension': {
          'artifact_path': str(artifact), 'artifact_revision': 'first',
        }}],
        'extra': {'element_docs_root': str(root), 'element_docs_api_json': str(artifact),
          'element_docs_api_revision': 'first'},
      }
      config_path = root / 'mkdocs.yml'
      config_path.write_text(json.dumps(config))

      def build():
        result = subprocess.run(['uv', 'run', 'zensical', 'build', '--strict', '--config-file', str(config_path)],
          cwd=repository, env={**os.environ, 'DOCS_COMPOSER': 'false', 'ELEMENT_DOCS_API': 'false'}, capture_output=True, text=True, timeout=90)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        return (root / 'site/components/example/index.html').read_text()

      html = build()
      self.assertIn('../../api/test/Config/#stable-config', html)
      self.assertNotIn('../../../api/test/Config/', html)
      self.assertIn('stable-config', Html((root / 'site/api/test/Config/index.html').read_text()).ids)

      widget_output = root / 'site' / widget_source.relative_to(root / 'docs').with_suffix('') / 'index.html'
      widget = Html(widget_output.read_text())
      widget_views = [element['attrs']['data-api-mode'] for element in widget.elements
                      if element['attrs'].get('data-api-symbol') == 'widget']
      self.assertEqual(widget_views, ['api'])
      self.assertIn('stable-widget', widget.ids)
      self.assertIn('stable-config', widget.ids)

      changed = deepcopy(data)
      changed['symbols'][0]['api']['documentation'] = [paragraph(text('Updated JSON without Markdown changes'))]
      artifact.write_text(json.dumps(changed))
      config['extra']['element_docs_api_revision'] = 'second'
      config['markdown_extensions'][0]['md_extension_element_api.extension']['artifact_revision'] = 'second'
      config_path.write_text(json.dumps(config))
      self.assertIn('Updated JSON without Markdown changes', build())
