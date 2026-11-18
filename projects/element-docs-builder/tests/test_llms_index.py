"""Exercise native index URLs separately from canonical page-content URLs."""

import json
from pathlib import Path
import subprocess
import sys
from tempfile import TemporaryDirectory
import unittest

from markdown import Markdown

from test_api_renderer import Html


class LlmsIndexTests(unittest.TestCase):
  def test_native_relative_index_preserves_subpath_metadata_and_canonical_content(self):
    with TemporaryDirectory() as directory:
      root = Path(directory)
      (root / 'docs/components').mkdir(parents=True)
      (root / 'docs/api').mkdir()
      (root / 'docs/components/example.md').write_text('# Example\n\n'
        '[Config](../api/Config.md#stable-config)\n\n'
        '[Demo](../demos/widget/)\n')
      (root / 'docs/api/Config.md').write_text('# Config\n\n<a id="stable-config"></a>\n')
      artifact = root / 'dist/element-docs/api-documentation.json'
      artifact.parent.mkdir(parents=True)
      artifact.write_text(json.dumps({'schemaVersion': 2, 'symbols': [], 'targets': {}}))
      config = {
        'site_name': 'Relative native index', 'site_description': 'Canonical site description',
        'site_url': 'https://example.test/design/', 'docs_dir': 'docs', 'site_dir': 'site',
        'plugins': [{'llmstxt': {'enabled': True, 'base_url': '', 'autoclean': True,
          'sections': {'Components': ['components/*.md'], 'API reference': ['api/*.md']},
          'preprocess': str(Path(__file__).resolve().parents[1] /
            'mkdocs_element_docs_builder/llms_preprocess.py')}}],
        'nav': [{'Components': [{'Example': 'components/example.md'},
          {'API': [{'Config': 'api/Config.md'}]}]}],
      }
      config_path = root / 'mkdocs.yml'
      config_path.write_text(json.dumps(config))

      result = subprocess.run([sys.executable, '-m', 'zensical', 'build', '--strict',
        '--config-file', str(config_path)], capture_output=True, text=True, timeout=90)
      self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

      site = root / 'site'
      index = (site / 'llms.txt').read_text()
      links = Html(Markdown().convert(index)).links
      self.assertEqual(links, ['components/example/index.md', 'api/Config/index.md'])
      for href in links:
        self.assertTrue((site / href).is_file(), href)
      self.assertIn('## Components', index)
      self.assertIn('## API reference', index)
      content = Html(Markdown().convert((site / links[0]).read_text()))
      self.assertIn('https://example.test/design/api/Config/#stable-config', content.links)
      self.assertIn('https://example.test/design/demos/widget/', content.links)
      html = Html((site / 'components/example/index.html').read_text())
      self.assertTrue(any(element['tag'] == 'link' and element['attrs'].get('rel') == 'canonical'
        and element['attrs'].get('href') == 'https://example.test/design/components/example/'
        for element in html.elements))
      self.assertTrue(any(element['tag'] == 'meta' and element['attrs'].get('name') == 'description'
        and element['attrs'].get('content') == 'Canonical site description' for element in html.elements))
      self.assertIn('https://example.test/design/api/Config/', (site / 'sitemap.xml').read_text())
