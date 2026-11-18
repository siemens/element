"""Public contract of export-only color and canonical link preprocessing."""

from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from markdown import Markdown
from mkdocs_element_docs_builder.structured_content import preprocess_content


class StructuredContentTests(unittest.TestCase):
  def render(self, html, output='index.md', site_url='https://element.example/'):
    return preprocess_content(html, output, site_url)

  def test_authored_palette_table_retains_color_meaning(self):
    html = Markdown(extensions=['tables']).convert('''| Color | Token |
| --- | --- |
| <si-docs-color style="background: #009999;"></si-docs-color> | `$brand` |
| <si-docs-color style="background: #0000004D;"></si-docs-color> | `$overlay` |
''')

    result = self.render(html)

    self.assertIn('<td><code>#009999</code></td>', result)
    self.assertIn('<td><code>#0000004D</code></td>', result)
    self.assertIn('<td><code>$brand</code></td>', result)
    self.assertNotIn('si-docs-color', result)

  def test_last_authored_background_and_child_content_are_preserved(self):
    html = '''<SI-DOCS-COLOR STYLE="background: red; BACKGROUND-COLOR: var(--brand); background: ">Brand</SI-DOCS-COLOR>
<si-docs-color style="color: red"><strong>No swatch</strong></si-docs-color>'''
    self.assertEqual(self.render(html), '<code>var(--brand)</code>Brand\n<strong>No swatch</strong>')

  def test_css_and_urls_are_escaped_text_never_executable_markup(self):
    html = '<si-docs-color style="background: url(https://example.invalid/swatch.svg?q=&quot;&lt;img&gt;&quot;&amp;x=1)"></si-docs-color>'
    self.assertEqual(self.render(html), '<code>url(https://example.invalid/swatch.svg?q="&lt;img&gt;"&amp;x=1)</code>')

  def test_semicolons_inside_css_values_do_not_create_declarations(self):
    html = '''<si-docs-color style="background: url('data:image/svg+xml;utf8,a'); content: 'text; background: red';"></si-docs-color>'''
    self.assertEqual(self.render(html), "<code>url('data:image/svg+xml;utf8,a')</code>")

  def test_literal_and_comment_markup_is_preserved_verbatim(self):
    swatch = '<si-docs-color style="background: #009999;"></si-docs-color>'
    literals = [
      f'<pre><code>{swatch}</code></pre>',
      f'<code>{swatch}</code>',
      f'<!-- {swatch} -->',
      f'<script>const text = \'{swatch}\';</script>',
      f'<style>/* {swatch} */</style>',
      f'<textarea>{swatch}</textarea>',
      f'<template>{swatch}</template>',
      '&lt;si-docs-color style="background: #009999;"&gt;&lt;/si-docs-color&gt;',
      f"<span title='{swatch}'>text</span>",
    ]
    for literal in literals:
      with self.subTest(literal=literal):
        self.assertEqual(self.render(literal), literal)

  def test_demo_directory_links_keep_browser_routes_query_and_fragment(self):
    html = '<a href="../../element-examples/?theme=dark&amp;mode=mobile#/viewer/preview?e=buttons/basic">Example</a><a href="../../dashboards-demo/">Dashboard</a>'
    self.assertEqual(self.render(html, 'components/buttons/index.md'), '<a href="https://element.example/element-examples/?theme=dark&amp;mode=mobile#/viewer/preview?e=buttons/basic">Example</a><a href="https://element.example/dashboards-demo/">Dashboard</a>')

  def test_local_fragments_use_each_output_routes_browser_equivalent(self):
    for output, route in [('index.md', '/'), ('foo/index.md', '/foo/'), ('foo.md', '/foo.html'), ('/foo/index.md', '/foo/')]:
      with self.subTest(output=output):
        self.assertEqual(self.render('<a href="#schematic-changes">Changes</a>', output), f'<a href="https://element.example{route}#schematic-changes">Changes</a>')

  def test_site_subpath_is_retained_and_root_relative_paths_use_origin(self):
    html = '<a href="../guide.html">Guide</a><a href="/element-examples/">Example</a><a href="#anchor">Local</a>'
    self.assertEqual(self.render(html, 'foo/index.md', 'https://element.example/design/system/'), '<a href="https://element.example/design/system/guide.html">Guide</a><a href="https://element.example/element-examples/">Example</a><a href="https://element.example/design/system/foo/#anchor">Local</a>')

  def test_query_links_and_attribute_escaping(self):
    html = '''<a class='link' href='?a=1&amp;b=&quot;quoted&quot;' title='unchanged &amp;'>Query</a><a href=guide.html>Guide</a>'''
    self.assertEqual(self.render(html, 'foo.md'), '''<a class='link' href="https://element.example/foo.html?a=1&amp;b=&quot;quoted&quot;" title='unchanged &amp;'>Query</a><a href="https://element.example/guide.html">Guide</a>''')

  def test_absolute_links_schemes_and_images_remain_verbatim(self):
    html = '''<a href='https://elsewhere.example/?a=1&amp;b=2'>External</a><a href="//cdn.example/path">CDN</a><a href="mailto:team@example.com">Mail</a><img src="../image.svg"><a href="tel:+123">Call</a>'''
    self.assertEqual(self.render(html), html)

  def test_literal_links_and_href_like_attribute_text_remain_unchanged(self):
    literal = '''<pre><code><a href="../sample/">Example</a></code></pre><!-- <a href="#sample">Sample</a> --><code>&lt;a href="sample.html"&gt;</code><span title='href="../not-a-link/"'>Text</span>'''
    html = literal + '<a href="guide.md">Guide</a><si-docs-color style="background: #009999"></si-docs-color>'
    self.assertEqual(self.render(html), literal + '<a href="https://element.example/guide.md">Guide</a><code>#009999</code>')

if __name__ == '__main__':
  unittest.main()
