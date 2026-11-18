"""Public contract of export-only color and canonical link preprocessing."""
from pathlib import Path
import sys
import pytest
from markdown import Markdown
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from siemens_angular_api_docs_zensical.structured_content import preprocess_content

BASE = 'https://element.example/'
UNCHANGED = None
OUTPUTS = {'fragment-directory': 'foo/index.md', 'fragment-file': 'foo.md', 'fragment-rooted': '/foo/index.md', 'site-subpath': 'foo/index.md', 'query-links': 'foo.md'}


@pytest.mark.parametrize(('case_id', 'html', 'site_url', 'expected'), [
  pytest.param('palette-table', Markdown(extensions=['tables']).convert('| Color | Token |\n| --- | --- |\n| <si-docs-color style="background: #009999;"></si-docs-color> | `$brand` |\n| <si-docs-color style="background: #0000004D;"></si-docs-color> | `$overlay` |'), BASE, '<table>\n<thead>\n<tr>\n<th>Color</th>\n<th>Token</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td><code>#009999</code></td>\n<td><code>$brand</code></td>\n</tr>\n<tr>\n<td><code>#0000004D</code></td>\n<td><code>$overlay</code></td>\n</tr>\n</tbody>\n</table>', id='palette-table'),
  pytest.param('background-and-child', '<SI-DOCS-COLOR STYLE="background: red; BACKGROUND-COLOR: var(--brand); background: ">Brand</SI-DOCS-COLOR>\n<si-docs-color style="color: red"><strong>No swatch</strong></si-docs-color>', BASE, '<code>var(--brand)</code>Brand\n<strong>No swatch</strong>', id='background-and-child'),
  pytest.param('escaped-css-url', '<si-docs-color style="background: url(https://example.invalid/swatch.svg?q=&quot;&lt;img&gt;&quot;&amp;x=1)"></si-docs-color>', BASE, '<code>url(https://example.invalid/swatch.svg?q="&lt;img&gt;"&amp;x=1)</code>', id='escaped-css-url'),
  pytest.param('quoted-semicolons', '<si-docs-color style="background: url(\'data:image/svg+xml;utf8,a\'); content: \'text; background: red\';"></si-docs-color>', BASE, "<code>url('data:image/svg+xml;utf8,a')</code>", id='quoted-semicolons'),
  pytest.param('literal-pre-code', '<pre><code><si-docs-color style="background: #009999;"></si-docs-color></code></pre>', BASE, UNCHANGED, id='literal-pre-code'),
  pytest.param('literal-code', '<code><si-docs-color style="background: #009999;"></si-docs-color></code>', BASE, UNCHANGED, id='literal-code'),
  pytest.param('literal-comment', '<!-- <si-docs-color style="background: #009999;"></si-docs-color> -->', BASE, UNCHANGED, id='literal-comment'),
  pytest.param('literal-script', '<script>const text = \'<si-docs-color style="background: #009999;"></si-docs-color>\';</script>', BASE, UNCHANGED, id='literal-script'),
  pytest.param('literal-style', '<style>/* <si-docs-color style="background: #009999;"></si-docs-color> */</style>', BASE, UNCHANGED, id='literal-style'),
  pytest.param('literal-textarea', '<textarea><si-docs-color style="background: #009999;"></si-docs-color></textarea>', BASE, UNCHANGED, id='literal-textarea'),
  pytest.param('literal-template', '<template><si-docs-color style="background: #009999;"></si-docs-color></template>', BASE, UNCHANGED, id='literal-template'),
  pytest.param('literal-escaped-tag', '&lt;si-docs-color style="background: #009999;"&gt;&lt;/si-docs-color&gt;', BASE, UNCHANGED, id='literal-escaped-tag'),
  pytest.param('literal-attribute', "<span title='<si-docs-color style=\"background: #009999;\"></si-docs-color>'>text</span>", BASE, UNCHANGED, id='literal-attribute'),
  pytest.param('demo-directory-links', '<a href="../../element-examples/?theme=dark&amp;mode=mobile#/viewer/preview?e=buttons/basic">Example</a><a href="../../dashboards-demo/">Dashboard</a>', BASE, '<a href="https://element.example/element-examples/?theme=dark&amp;mode=mobile#/viewer/preview?e=buttons/basic">Example</a><a href="https://element.example/dashboards-demo/">Dashboard</a>', id='demo-directory-links'),
  pytest.param('fragment-root', '<a href="#schematic-changes">Changes</a>', BASE, '<a href="https://element.example/#schematic-changes">Changes</a>', id='fragment-root'),
  pytest.param('fragment-directory', '<a href="#schematic-changes">Changes</a>', BASE, '<a href="https://element.example/foo/#schematic-changes">Changes</a>', id='fragment-directory'),
  pytest.param('fragment-file', '<a href="#schematic-changes">Changes</a>', BASE, '<a href="https://element.example/foo.html#schematic-changes">Changes</a>', id='fragment-file'),
  pytest.param('fragment-rooted', '<a href="#schematic-changes">Changes</a>', BASE, '<a href="https://element.example/foo/#schematic-changes">Changes</a>', id='fragment-rooted'),
  pytest.param('site-subpath', '<a href="../guide.html">Guide</a><a href="/element-examples/">Example</a><a href="#anchor">Local</a>', 'https://element.example/design/system/', '<a href="https://element.example/design/system/guide.html">Guide</a><a href="https://element.example/element-examples/">Example</a><a href="https://element.example/design/system/foo/#anchor">Local</a>', id='site-subpath'),
  pytest.param('query-links', "<a class='link' href='?a=1&amp;b=&quot;quoted&quot;' title='unchanged &amp;'>Query</a><a href=guide.html>Guide</a>", BASE, '<a class=\'link\' href="https://element.example/foo.html?a=1&amp;b=&quot;quoted&quot;" title=\'unchanged &amp;\'>Query</a><a href="https://element.example/guide.html">Guide</a>', id='query-links'),
  pytest.param('absolute-links-and-images', "<a href='https://elsewhere.example/?a=1&amp;b=2'>External</a><a href=\"//cdn.example/path\">CDN</a><a href=\"mailto:team@example.com\">Mail</a><img src=\"../image.svg\"><a href=\"tel:+123\">Call</a>", BASE, UNCHANGED, id='absolute-links-and-images'),
  pytest.param('literal-links-and-color', '<pre><code><a href="../sample/">Example</a></code></pre><!-- <a href="#sample">Sample</a> --><code>&lt;a href="sample.html"&gt;</code><span title=\'href="../not-a-link/"\'>Text</span><a href="guide.md">Guide</a><si-docs-color style="background: #009999"></si-docs-color>', BASE, '<pre><code><a href="../sample/">Example</a></code></pre><!-- <a href="#sample">Sample</a> --><code>&lt;a href="sample.html"&gt;</code><span title=\'href="../not-a-link/"\'>Text</span><a href="https://element.example/guide.md">Guide</a><code>#009999</code>', id='literal-links-and-color'),
])
def test_preprocess_content(case_id, html, site_url, expected):
  output = OUTPUTS.get(case_id, 'index.md')
  assert preprocess_content(html, output, site_url) == (html if expected is UNCHANGED else expected)
