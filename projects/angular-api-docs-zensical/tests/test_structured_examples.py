"""Structured-export example sources, labels, links, and failure cases."""

import json
from html import unescape
import re

import pytest
from markdown import Markdown

from docs_fixtures import Html, fixture
from md_extension_element_docs.extension import ElementDocsExtension
from siemens_angular_api_docs_zensical import llms_preprocess
from siemens_angular_api_docs_zensical.structured_examples import preprocess_examples

LITERALS = '''<p><code>&lt;si-docs-component example="m"&gt;</code></p><code><si-docs-component example="m"/></code><pre>
<si-docs-component example="m"/></pre><!-- <si-docs-component example="m"/> --><script>'<si-docs-component example="m"/>'</script>'''
TABS = '''<SI-DOCS-COMPONENT BASE="group&#47;" example="parent" title="Ignored">
  <si-docs-tab example="second" heading="Second &amp; &lt;safe&gt;" base="ignored"/><si-docs-tab example="third" title="x"></si-docs-tab>
  <si-docs-tab heading="No example"/><div><si-docs-tab example="missing"/></div>
</SI-DOCS-COMPONENT>'''
SUCCESS = {
  'component-and-template': ('<si-docs-component example="b/basic"></si-docs-component>', {
    'b/basic.ts': "// café\r\nimport './helper';\r\nconst a = '<>&amp;';\r\n",
    'b/basic.html': '<button title="&quot;">{{ a < b }} &amp; é</button>\n', 'b/basic.scss': 'NOPE', 'b/helper.ts': 'NOPE'},
    ['b/basic.ts', 'b/basic.html']),
  'inline-template': ('<si-docs-component example="inline"/>', {'inline.ts': "@Component({template: '<p>Hi</p>'})\n"}, ['inline.ts']),
  'tabs-in-order': (TABS, {'group/parent.ts': 'parent', 'group/second.ts': 'second', 'group/third.ts': 'third'},
                    ['group/parent.ts', 'group/second.ts', 'group/third.ts']),
  'surrounding-html': ('<!-- keep -->\n<div title="A &amp; B"><si-docs-component example="one"/><p>Between &#x26;</p>'
                       '<si-docs-component example="two"/></div>\n', {'one.ts': 'ONE', 'two.ts': 'TWO'}, ['one.ts', 'two.ts']),
  'literals-untouched': (LITERALS, {}, []),
  'symlink-within-root': ('<si-docs-component example="alias"/>', {'real.ts': 'SAFE', 'alias.ts': ('examples/real.ts',)}, ['alias.ts']),
  'external-link': ('<si-docs-component example="https://example.test/demo?a=1&amp;b=>#preview"/><p>After</p>', {}, []),
  'external-base-tabs': ('<si-docs-component base="https://example.test/demos/"><si-docs-tab example="first" heading="First"/>'
                          '<si-docs-tab example="second" heading="Second"/></si-docs-component>', {}, []),
}


def build(tmp_path, tree):
  root = tmp_path / 'examples'
  root.mkdir()
  (tmp_path / 'secret').write_text('SECRET')
  for name, content in tree.items():
    (root / name).parent.mkdir(parents=True, exist_ok=True)
    if isinstance(content, tuple):
      (root / name).symlink_to(tmp_path / content[0])
    else:
      (root / name).write_text(content, newline='')
  return root


@pytest.mark.parametrize('case', SUCCESS)
def test_preprocess_examples(tmp_path, case):
  html, tree, files = SUCCESS[case]
  root = build(tmp_path, tree)
  output = preprocess_examples(html, root)
  assert preprocess_examples(output, root) == output
  if case == 'literals-untouched':
    assert output == html
    return

  assert '<si-docs-' not in output
  expected_sources = [
    ('typescript' if file.endswith('.ts') else 'html', (root / file).read_bytes().decode())
    for file in files
  ]
  assert [(language, unescape(source)) for language, source in code_blocks(output)] == expected_sources
  if case == 'tabs-in-order':
    assert re.findall(r'<h5>(.*?)</h5>', output) == ['parent', 'Second &amp; &lt;safe&gt;', 'third']
  elif case == 'surrounding-html':
    assert output.startswith('<!-- keep -->\n<div title="A &amp; B">')
    assert output.index('ONE') < output.index('<p>Between &#x26;</p>') < output.index('TWO')
    assert output.endswith('</div>\n')
  elif case == 'external-link':
    assert Html(output).links == ['https://example.test/demo?a=1&b=>#preview']
    assert output.endswith('<p>After</p>')
  elif case == 'external-base-tabs':
    assert Html(output).links == ['https://example.test/demos/first', 'https://example.test/demos/second']
    assert re.findall(r'<h5>(.*?)</h5>', output) == ['First', 'Second']


def code_blocks(html):
  return re.findall(r'<pre><code class="language-([a-z]+)">(.*?)</code></pre>', html, re.DOTALL)


def test_legacy_tabs_keep_native_labels_and_all_examples(tmp_path, monkeypatch):
  examples = build(tmp_path, {'one.ts': 'FIRST', 'two.ts': 'SECOND'})
  prepared = tmp_path / 'prepared'
  prepared.mkdir()
  (prepared / 'api-documentation.json').write_text(json.dumps(fixture()))
  config = {'root_dir': str(tmp_path), 'site_url': 'https://example.test/', 'extra': {'element_docs': {
    'api': {'enabled': True, 'artifact_dir': 'prepared'}, 'export': {'examples_dir': examples.name},
  }}}
  monkeypatch.setattr(llms_preprocess, 'get_config', lambda: config)
  markdown = Markdown(extensions=[ElementDocsExtension(), 'pymdownx.blocks.tab', 'attr_list'])
  blocks = '\n\n'.join(f'<si-docs-component example="{name}"></si-docs-component>' for name in ('one', 'two'))
  html = markdown.convert(f'## Design ---\n\nText.\n\n## Code ---\n\n{blocks}')
  exported = llms_preprocess.preprocess(html, 'index.md')
  assert re.findall(r'<label[^>]*>(.*?)</label>', exported) == ['Design', 'Code']
  assert code_blocks(exported) == [('typescript', 'FIRST'), ('typescript', 'SECOND')]


C = '<si-docs-component {}/>'
FAILURES = [
  (C.format('example="m"'), {'m.html': 'x'}, r'Cannot read documentation example source m\.ts'),
  ('<si-docs-component/>', {}, 'requires an example'),
  (C.format('example'), {}, "Invalid 'example'"),
  (C.format('example="a" example="b"'), {}, "Duplicate 'example'"),
  ('<si-docs-component><si-docs-tab example="a" heading/></si-docs-component>', {}, "Invalid 'heading'"),
  *[(C.format(a), {}, '(Unsafe|Invalid) documentation example path')
    for a in ('example="../s"', 'example="%2e%2e/s"', r'example="..\s"', 'example="javascript:x"', 'base="/abs" example="a"')],
  *[(C.format(f'example="{u}"'), {}, 'external documentation example URL') for u in ('https://', 'https://example.test:bad/d')],
  *[(C.format('example="l"'), {'l.ts': 'SAFE', f'l.{ext}': ('secret',)}, 'escapes examples root') for ext in ('ts', 'html')],
  (C.format('example="d/s"'), {'d': ('.',)}, 'escapes examples root'),
  (C.format('example="o"'), {'o.ts': 'ONE', 'o.html': ('examples/missing.html',)}, r'Cannot read documentation example source o\.html'),
  ('<si-docs-component example="a">', {}, '[Uu]nclosed'), ('<si-docs-component><si-docs-component example="a"/></si-docs-component>', {}, 'Nested'),
]


@pytest.mark.parametrize('html, tree, message', FAILURES)
def test_preprocess_examples_rejects(tmp_path, html, tree, message):
  with pytest.raises(ValueError, match=message):
    preprocess_examples(html, build(tmp_path, tree))
