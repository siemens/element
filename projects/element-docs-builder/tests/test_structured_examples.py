"""Public contract of the HTML-only structured-export example adapter."""

from html.parser import HTMLParser
from pathlib import Path
import sys
from tempfile import TemporaryDirectory
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from markdown import Markdown
from md_extension_element_docs.extension import ElementDocsExtension
from mkdocs_element_docs_builder.structured_examples import preprocess_examples


class SemanticHTML(HTMLParser):
  def __init__(self, html):
    super().__init__()
    self.codes = []
    self.headings = []
    self.links = []
    self.current = None
    self.feed(html)

  def handle_starttag(self, tag, attrs):
    if tag == 'code':
      self.codes.append([dict(attrs).get('class'), ''])
      self.current = self.codes[-1]
    elif tag in {'h4', 'h5'}:
      self.headings.append([tag, ''])
      self.current = self.headings[-1]
    elif tag == 'a':
      self.links.append([dict(attrs).get('href'), ''])
      self.current = self.links[-1]

  def handle_data(self, data):
    if self.current is not None:
      self.current[1] += data

  def handle_endtag(self, tag):
    if tag in {'code', 'h4', 'h5', 'a'}:
      self.current = None


class StructuredExamplesTests(unittest.TestCase):
  def setUp(self):
    self.directory = TemporaryDirectory()
    self.addCleanup(self.directory.cleanup)
    self.root = Path(self.directory.name) / 'examples'
    self.root.mkdir()

  def source(self, name, content, suffix='.ts'):
    path = self.root / (name + suffix)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('w', encoding='utf-8', newline='') as stream:
      stream.write(content)
    return path

  def render(self, html):
    return preprocess_examples(html, self.root)

  def test_exact_component_and_adjacent_template_are_semantic_code(self):
    component = "// café\r\nimport './helper';\r\nconst text = '<>&amp;';\r\n"
    template = '<button title="&quot;">{{ a < b }} &amp; é</button>\n'
    self.source('buttons/basic', component)
    self.source('buttons/basic', template, '.html')
    self.source('buttons/helper', 'DO NOT INCLUDE')
    self.source('buttons/basic', 'DO NOT INCLUDE', '.scss')

    output = self.render('<si-docs-component example="buttons/basic"></si-docs-component>')

    semantic = SemanticHTML(output)
    self.assertEqual(semantic.headings, [['h4', 'Example']])
    self.assertEqual(semantic.codes, [['language-typescript', component], ['language-html', template]])
    self.assertIn('<p>Component:</p><pre><code', output)
    self.assertIn('<p>Template:</p><pre><code', output)
    self.assertNotIn('DO NOT INCLUDE', output)

  def test_inline_template_needs_no_adjacent_html(self):
    component = "@Component({template: '<p>Hello</p>'})\n"
    self.source('inline', component)
    output = self.render('<si-docs-component example="inline"></si-docs-component>')
    self.assertEqual(SemanticHTML(output).codes, [['language-typescript', component]])
    self.assertNotIn('Template:', output)

  def test_parent_then_tabs_in_authored_order_with_runtime_labels(self):
    for name in ['parent', 'second', 'third']:
      self.source('group/' + name, name)
    html = '''<SI-DOCS-COMPONENT BASE="group&#47;" example="parent" title="Ignored">
      <si-docs-tab example="second" heading="Second &amp; &lt;safe&gt;" base="ignored" title="Ignored"/>
      <si-docs-tab example="third" title="Not a runtime label"></si-docs-tab>
      <si-docs-tab heading="No example"/><div><si-docs-tab example="missing"/></div>
    </SI-DOCS-COMPONENT>'''
    result = SemanticHTML(self.render(html))
    self.assertEqual(result.codes, [['language-typescript', name] for name in ['parent', 'second', 'third']])
    self.assertEqual(result.headings, [
      ['h4', 'Example'], ['h5', 'parent'], ['h5', 'Second & <safe>'], ['h5', 'third'],
    ])

  def test_multiple_components_preserve_surrounding_html_verbatim(self):
    self.source('one', 'ONE')
    self.source('two', 'TWO')
    before = '<!-- untouched -->\n<div title="A &amp; B"><svg><path d="x"/></svg>'
    middle = '<img src="data:image/svg+xml,%3Csvg%3E">\n<p>Between &#x26; after.</p>'
    after = '</div>\n'
    output = self.render(before + '<si-docs-component example="one"/>' + middle + '<si-docs-component example="two"/>' + after)
    self.assertTrue(output.startswith(before))
    self.assertIn(middle, output)
    self.assertTrue(output.endswith(after))
    self.assertEqual(SemanticHTML(output).codes, [['language-typescript', 'ONE'], ['language-typescript', 'TWO']])

  def test_escaped_literals_comments_and_code_elements_are_untouched(self):
    html = '''<p><code>&lt;si-docs-component example="missing"&gt;&lt;/si-docs-component&gt;</code></p>
      <pre><code class="language-html">&lt;si-docs-component example="missing"&gt;</code></pre>
      <code><si-docs-component example="missing"></si-docs-component></code>
      <pre><si-docs-component example="missing"/></pre>
      <!-- <si-docs-component example="missing"></si-docs-component> -->
      <script>const text = '<si-docs-component example="missing"/>';</script>'''
    self.assertEqual(self.render(html), html)

  def test_external_examples_are_readable_safe_links_without_source_reads(self):
    url = 'https://example.test/demo?a=1&b=>#preview'
    output = self.render('<si-docs-component example="https://example.test/demo?a=1&amp;b=>#preview"/><p>After</p>')
    semantic = SemanticHTML(output)
    self.assertEqual(semantic.links, [[url, url]])
    self.assertEqual(semantic.codes, [])
    self.assertTrue(output.endswith('<p>After</p>'))

  def test_external_base_retains_all_tab_labels(self):
    output = self.render('''<si-docs-component base="https://example.test/demos/">
      <si-docs-tab example="first" heading="First"/><si-docs-tab example="second" heading="Second"/>
    </si-docs-component>''')
    result = SemanticHTML(output)
    self.assertEqual(result.links, [[f'https://example.test/demos/{name}'] * 2 for name in ['first', 'second']])
    self.assertEqual(result.headings, [['h4', 'Example'], ['h5', 'First'], ['h5', 'Second']])

  def test_missing_typescript_is_clear_failure_even_if_html_exists(self):
    self.source('missing', '<p>Not enough</p>', '.html')
    with self.assertRaisesRegex(ValueError, r'Cannot read documentation example source missing\.ts'):
      self.render('<si-docs-component example="missing"/>')

  def test_invalid_or_missing_required_attributes_fail(self):
    cases = [
      ('<si-docs-component/>', 'requires an example'),
      ('<si-docs-component example/>', "Invalid 'example'"),
      ('<si-docs-component example="one" example="two"/>', "Duplicate 'example'"),
      ('<si-docs-component><si-docs-tab example="one" heading/></si-docs-component>', "Invalid 'heading'"),
    ]
    for html, diagnostic in cases:
      with self.subTest(html=html), self.assertRaisesRegex(ValueError, diagnostic):
        self.render(html)

  def test_unsafe_local_paths_are_rejected_in_example_and_base(self):
    for attributes in ('example="../secret"', 'example="%2e%2e/secret"', r'example="..\secret"',
                       'example="javascript:alert(1)"', 'base="/absolute" example="one"',
                       'base="../secret" example="one"'):
      with self.subTest(attributes=attributes), self.assertRaisesRegex(ValueError, '(Unsafe|Invalid) documentation example path'):
        self.render(f'<si-docs-component {attributes}/>')

  def test_malformed_external_urls_fail(self):
    for value in ['https://', 'https://example.test:bad/demo']:
      with self.subTest(value=value), self.assertRaisesRegex(ValueError, 'external documentation example URL'):
        self.render(f'<si-docs-component example="{value}"/>')

  def test_source_and_template_symlink_escapes_are_rejected(self):
    outside = Path(self.directory.name) / 'secret'
    outside.write_text('SECRET', encoding='utf-8')
    for suffix in ['.ts', '.html']:
      with self.subTest(suffix=suffix):
        self.source('linked', 'SAFE')
        link = self.root / ('linked' + suffix)
        if link.exists():
          link.unlink()
        link.symlink_to(outside)
        with self.assertRaisesRegex(ValueError, 'escapes examples root'):
          self.render('<si-docs-component example="linked"/>')
        link.unlink()

  def test_directory_symlink_escape_is_rejected(self):
    (self.root / 'linked').symlink_to(self.directory.name, target_is_directory=True)
    with self.assertRaisesRegex(ValueError, 'escapes examples root'):
      self.render('<si-docs-component example="linked/secret"/>')

  def test_symlinks_within_examples_root_are_supported(self):
    target = self.source('real', 'SAFE')
    (self.root / 'alias.ts').symlink_to(target)
    result = SemanticHTML(self.render('<si-docs-component example="alias"/>'))
    self.assertEqual(result.codes, [['language-typescript', 'SAFE']])

  def test_broken_optional_template_symlink_is_not_silently_omitted(self):
    self.source('one', 'ONE')
    (self.root / 'one.html').symlink_to(self.root / 'missing.html')
    with self.assertRaisesRegex(ValueError, r'Cannot read documentation example source one\.html'):
      self.render('<si-docs-component example="one"/>')

  def test_unclosed_and_nested_components_fail_clearly(self):
    for html in ['<si-docs-component example="one">',
                 '<si-docs-component><si-docs-component example="one"/></si-docs-component>']:
      with self.subTest(html=html), self.assertRaisesRegex(ValueError, '[Uu]nclosed|Nested'):
        self.render(html)

  def test_export_does_not_reexpand_literal_source(self):
    component = "const example = '<si-docs-component example=\"missing\"/>';"
    self.source('one', component)
    html = '<si-docs-component example="one"/>'
    first = self.render(html)
    self.assertEqual(self.render(first), first)

  def test_legacy_tabs_keep_native_labels_headings_and_all_examples(self):
    self.source('one', 'FIRST')
    self.source('two', 'SECOND')
    markdown = Markdown(extensions=[ElementDocsExtension(), 'pymdownx.blocks.tab', 'attr_list'])
    html = markdown.convert('''## Design ---

Design guidance.

## Code ---

<si-docs-component example="one"></si-docs-component>

<si-docs-component example="two"></si-docs-component>
''')
    output = self.render(html)
    self.assertIn('>Design</label>', output)
    self.assertIn('>Code</label>', output)
    self.assertEqual(SemanticHTML(output).codes, [['language-typescript', 'FIRST'], ['language-typescript', 'SECOND']])


if __name__ == '__main__':
  unittest.main()
