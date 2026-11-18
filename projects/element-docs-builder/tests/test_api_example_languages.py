"""Authored example metadata survives browser and native Markdown rendering."""

from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import subprocess
from tempfile import TemporaryDirectory
import unittest

from test_api_structured import fixture, fragment
from md_extension_element_api.renderer import ApiRenderer
from md_extension_element_api.structured import preprocess_api


EXAMPLES = [
  ('ts', "const result = '  preserve spacing';"),
  ('typescript', "const value: string = '<literal>&';"),
  ('html', '<test-widget [value]="value" />'),
  ('css', '.example {\n  color: red;\n}'),
  ('sh', "echo '<literal>&'"),
  (None, 'unlabelled <literal>&'),
]


class CodeBlocks(HTMLParser):
  def __init__(self, source):
    super().__init__()
    self.blocks = []
    self.current = None
    self.pre = False
    self.feed(source)

  def handle_starttag(self, tag, attrs):
    if tag == 'pre':
      self.pre = True
    if tag == 'code' and self.pre:
      self.current = [dict(attrs).get('class'), '']

  def handle_data(self, data):
    if self.current is not None:
      self.current[1] += data

  def handle_endtag(self, tag):
    if tag == 'code' and self.current is not None:
      self.blocks.append(tuple(self.current))
      self.current = None
    if tag == 'pre':
      self.pre = False


class ApiExampleLanguageTests(unittest.TestCase):
  def setUp(self):
    self.data = fixture()
    self.data['symbols'][1]['referencePath'] = None
    self.data['symbols'][0]['api']['documentation'] = [
      {'kind': 'code', 'parts': [{**fragment(code), 'kind': 'code'}],
       **({'language': language} if language else {})}
      for language, code in EXAMPLES
    ]

  def browser(self):
    return ''.join(ApiRenderer(self.data).prepare_page(
      [{'mode': 'api', 'name': 'Widget'}], 'index.md', ()))

  def test_browser_and_structured_html_keep_languages_and_literal_code(self):
    browser = self.browser()
    structured = preprocess_api(browser, self.data, 'index.md', 'https://docs.example/element/')

    for html in (browser, structured):
      with self.subTest(rendering='browser' if html == browser else 'structured'):
        blocks = CodeBlocks(html).blocks
        for language, code in EXAMPLES:
          self.assertIn(('language-' + language if language else None, code), blocks)

  def test_native_markdown_keeps_authored_fence_languages_and_literal_code(self):
    repository = Path(__file__).resolve().parents[3]
    with TemporaryDirectory() as directory:
      root = Path(directory)
      (root / 'docs').mkdir()
      browser = self.browser()
      # Use the same prepared semantic HTML boundary as native publication.
      (root / 'docs/index.md').write_text('# Examples\n\n' + browser)
      (root / 'api.json').write_text(json.dumps(self.data))
      (root / 'preprocess.py').write_text(
        'import json\nfrom pathlib import Path\n'
        'from md_extension_element_api.structured import preprocess_api\n'
        f'data = json.loads(Path({str(root / "api.json")!r}).read_text())\n'
        'def preprocess(html, output):\n'
        '  return preprocess_api(html, data, output, "https://docs.example/element/")\n'
      )
      (root / 'mkdocs.yml').write_text(json.dumps({
        'site_name': 'API example languages', 'site_url': 'https://docs.example/element/',
        'docs_dir': 'docs', 'site_dir': 'site',
        'plugins': [{'llmstxt': {'sections': {'API': ['index.md']},
                                'preprocess': str(root / 'preprocess.py')}}],
      }))

      result = subprocess.run(
        ['uv', 'run', '--no-sync', 'zensical', 'build', '--strict', '--config-file', str(root / 'mkdocs.yml')],
        cwd=repository, env={**os.environ, 'ELEMENT_DOCS_API': 'false'}, capture_output=True, text=True, timeout=90)

      self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
      exported = (root / 'site/index.md').read_text()
      blocks = re.findall(r'^```([^\n]*)\n(.*?)\n```', exported, re.MULTILINE | re.DOTALL)
      for language, code in EXAMPLES:
        with self.subTest(language=language):
          self.assertIn((language or '', code), blocks)


if __name__ == '__main__':
  unittest.main()
