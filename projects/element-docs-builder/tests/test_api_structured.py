"""Prepared API semantics for the native page-content preprocessing boundary."""

from copy import deepcopy
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import subprocess
import sys
from tempfile import TemporaryDirectory
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from md_extension_element_api.adapter import ApiRenderError
from md_extension_element_api.renderer import ApiRenderer
from md_extension_element_api.structured import preprocess_api


def fragment(value, target=None):
  return {'kind': 'link' if target else 'text', 'text': value, 'targetId': target, 'href': None}


def paragraph(*parts):
  return {'kind': 'paragraph', 'parts': list(parts)}


def row(node_id, name, **values):
  return {'id': node_id, 'name': name, 'type': [fragment('string')], 'badges': [],
          'default': None, 'documentation': [], 'signatures': [], 'sourceUrl': None, **values}


def view(**values):
  return {'documentation': [], 'declaration': [], 'signatures': [], 'groups': [], 'relatedTypeIds': [], **values}


def fixture():
  run = row('widget.run', 'run', sourceUrl='https://source.example/widget.ts#L5', badges=['public'], signatures=[{
    'id': f'widget.run.{number}', 'label': [fragment(f'run(value: {kind}): Config')],
    'documentation': [paragraph(fragment(f'Overload {number}.'))],
    'parameters': [row(f'widget.run.{number}.value', 'value', documentation=[paragraph(fragment('The argument.'))])],
    'returns': [fragment('Config', 'config')],
  } for number, kind in ((1, 'string'), (2, 'Config'))])
  widget_view = view(documentation=[paragraph(fragment('Uses '), fragment('Config', 'config'))], groups=[
    {'kind': 'inputs', 'title': 'Inputs', 'showDefaults': True, 'rows': [row(
      'widget.value', 'publicValue', type=[fragment('Config', 'config')], badges=['required', 'signal'],
      default="'<unsafe>'", documentation=[paragraph(fragment('Prepared input.'))])]},
    {'kind': 'methods', 'title': 'Methods', 'showDefaults': False, 'rows': [run]},
  ], relatedTypeIds=['config'])
  symbols = [
    {'id': 'widget', 'name': 'Widget', 'kind': 'component', 'api': widget_view, 'type': deepcopy(widget_view),
     'metadata': [{'label': 'Selector', 'value': 'test-widget'}], 'sourceUrl': 'https://source.example/widget.ts',
     'importStatement': "import { Widget } from '@test/library';", 'referencePath': 'api/Widget.md'},
    {'id': 'config', 'name': 'Config', 'kind': 'type_alias', 'api': view(),
     'type': view(declaration=[fragment('type Config = Record<string, "<literal>">')],
                  documentation=[paragraph(fragment('Prepared alias documentation.'))]),
     'metadata': [], 'sourceUrl': None, 'importStatement': None, 'referencePath': 'api/Config.md'},
  ]
  node_ids = ['widget', 'widget.value', 'widget.run', 'widget.run.1', 'widget.run.1.value',
              'widget.run.2', 'widget.run.2.value', 'config']
  return {'schemaVersion': 2, 'symbols': symbols,
          'index': {symbol['name']: [symbol['id']] for symbol in symbols},
          'targets': {node_id: {'symbolId': node_id.split('.')[0], 'anchor': node_id.replace('.', '-')}
                      for node_id in node_ids},
          'members': {'run-selection': {'symbolId': 'widget', 'view': view(groups=[{
            'kind': 'methods', 'title': 'Methods', 'showDefaults': False, 'rows': [deepcopy(run)],
          }], relatedTypeIds=['config'])}}, 'memberIndex': {'Widget.run': ['run-selection']}}


class Html(HTMLParser):
  def __init__(self, source):
    super().__init__()
    self.ids = []
    self.links = []
    self.elements = []
    self.text = []
    self.feed(source)

  def handle_starttag(self, tag, attrs):
    attrs = dict(attrs)
    self.elements.append((tag, attrs))
    if 'id' in attrs:
      self.ids.append(attrs['id'])
    if tag == 'a':
      self.links.append(attrs['href'])

  def handle_data(self, data):
    self.text.append(data)


class StructuredApiTests(unittest.TestCase):
  def setUp(self):
    self.data = fixture()

  def browser(self, requests, reserved=(), source='components/widget.md'):
    return ''.join(ApiRenderer(self.data).prepare_page(deepcopy(requests), source, reserved))

  def export(self, html, output='components/widget/index.md'):
    return preprocess_api(html, self.data, output, 'https://docs.example/element/')

  def test_hidden_alias_declaration_is_exported_from_json_without_mutating_data(self):
    before = deepcopy(self.data)
    browser = self.browser([{'mode': 'type', 'name': 'Config', 'heading': 'Configuration'}])
    self.assertNotIn('type Config =', browser)

    exported = self.export(browser)

    self.assertIn('<h3>Configuration</h3>', exported)
    self.assertIn('type Config = Record&lt;string, &#34;&lt;literal&gt;&#34;&gt;', exported)
    self.assertIn('Prepared alias documentation.', exported)
    self.assertNotIn('api-type-card', exported)
    self.assertEqual(self.data, before)

  def test_metadata_imports_defaults_badges_and_documentation_are_preserved(self):
    browser = self.browser([{'mode': 'api', 'name': 'Widget'}])

    exported = self.export(browser)

    for expected in ('Selector:', 'test-widget', 'Kind:', 'component', 'import { Widget }',
                     'publicValue', 'required, signal', 'Prepared input.', '&#39;&lt;unsafe&gt;&#39;'):
      with self.subTest(expected=expected):
        self.assertIn(expected, exported)
    self.assertIn('https://source.example/widget.ts', Html(exported).links)
    self.assertNotIn('api-table', exported)
    self.assertNotIn('colgroup', exported)

  def test_overloads_use_method_sections_with_independent_parameter_tables_and_returns(self):
    run = self.data['symbols'][0]['api']['groups'][1]['rows'][0]
    run['documentation'] = [paragraph(fragment('Overload 1.'))]

    exported = self.export(self.browser([{'mode': 'api', 'name': 'Widget'}]))

    self.assertIn('<h4>Methods</h4>', exported)
    self.assertIn('<h5>run</h5>', exported)
    self.assertIn('<section id="widget-run-1">', exported)
    self.assertIn('<section id="widget-run-2">', exported)
    self.assertEqual(exported.count('Overload 1.'), 1)
    self.assertEqual(exported.count('Overload 2.'), 1)
    self.assertEqual(exported.count('<h4>Parameters</h4>'), 2)
    self.assertEqual(exported.count('<strong>Returns: </strong>'), 2)
    self.assertEqual(exported.count('<table>'), 3)
    self.assertIn('public', exported)
    self.assertIn('https://source.example/widget.ts#L5', Html(exported).links)

  def test_related_embeds_restore_declarations_and_resolve_forward_local_links(self):
    browser = self.browser([{'mode': 'api', 'name': 'Widget'}, {'mode': 'types'}])

    exported = self.export(browser)

    self.assertIn('type Config =', exported)
    self.assertIn('https://docs.example/element/components/widget/#config', Html(exported).links)
    self.assertNotIn('https://docs.example/element/api/Config/#config', Html(exported).links)
    self.assertEqual(Html(browser).ids, Html(exported).ids)

  def test_member_selection_keeps_only_the_selected_view_and_related_types(self):
    browser = self.browser([{'mode': 'type', 'name': 'Widget.run'}, {'mode': 'types'}])

    exported = self.export(browser)

    self.assertIn('run(value: string): Config', exported)
    self.assertIn('type Config =', exported)
    self.assertNotIn('publicValue', exported)
    self.assertNotIn('import { Widget }', exported)
    self.assertNotIn('widget', Html(exported).ids)
    self.assertEqual(Html(browser).ids, Html(exported).ids)

  def test_prepared_member_selection_id_distinguishes_alias_views_with_the_same_row_id(self):
    for alias in ('inputAlias', 'outputAlias'):
      self.data['members'][alias] = {'symbolId': 'widget', 'view': view(groups=[{
        'kind': 'inputs', 'title': 'Bindings', 'showDefaults': True,
        'rows': [row('widget.value', alias, type=[fragment(alias + 'Type')])],
      }])}
      self.data['memberIndex']['Widget.' + alias] = [alias]
    browser = self.browser([{'mode': 'api', 'name': 'Widget.inputAlias'}, {'mode': 'type', 'name': 'Widget.outputAlias'}])

    exported = self.export(browser)

    self.assertIn('inputAliasType', exported)
    self.assertIn('outputAliasType', exported)
    self.assertNotIn('publicValue', exported)
    self.assertEqual(Html(browser).ids, Html(exported).ids)

  def test_repeated_members_link_to_their_own_existing_collision_adjusted_anchor(self):
    run = self.data['members']['run-selection']['view']['groups'][0]['rows'][0]
    run['documentation'] = [paragraph(fragment('Self', 'widget.run'))]
    browser = self.browser([{'mode': 'type', 'name': 'Widget.run'}] * 2, reserved=['widget-run'])

    exported = self.export(browser)

    self.assertEqual(Html(browser).ids, Html(exported).ids)
    self.assertIn('https://docs.example/element/components/widget/#widget-run--2', Html(exported).links)
    self.assertIn('https://docs.example/element/components/widget/#widget-run--3', Html(exported).links)
    self.assertNotIn('https://docs.example/element/components/widget/#widget-run', Html(exported).links)

  def test_unpublished_symbol_uses_local_anchor_when_embedded_and_plain_text_otherwise(self):
    self.data['symbols'][1]['referencePath'] = None

    external = self.export(self.browser([{'mode': 'api', 'name': 'Widget'}]))
    local = self.export(self.browser([{'mode': 'api', 'name': 'Widget'}, {'mode': 'types'}]))

    self.assertIn('<code>Config</code>', external)
    self.assertFalse(any('#config' in link for link in Html(external).links))
    self.assertIn('https://docs.example/element/components/widget/#config', Html(local).links)

  def test_external_reference_paths_and_index_paths_are_absolute_directory_urls(self):
    for reference, expected in (('api/Config.md', 'api/Config/'), ('api/types/index.md', 'api/types/'),
                                ('api/myindex.md', 'api/myindex/'), ('index.md', '')):
      with self.subTest(reference=reference):
        self.data['symbols'][1]['referencePath'] = reference
        exported = self.export(self.browser([{'mode': 'api', 'name': 'Widget'}]))
        self.assertIn('https://docs.example/element/' + expected + '#config', Html(exported).links)

  def test_native_output_path_controls_local_page_url_including_html_output(self):
    browser = self.browser([{'mode': 'api', 'name': 'Widget'}, {'mode': 'types'}])
    for output, page in (('guide/index.md', 'guide/'), ('guide.md', 'guide.html'), ('index.md', '')):
      with self.subTest(output=output):
        self.assertIn('https://docs.example/element/' + page + '#config', Html(self.export(browser, output)).links)

  def test_no_heading_remains_without_a_symbol_heading(self):
    browser = self.browser([{'mode': 'type', 'name': 'Config', 'no_heading': True}])

    exported = self.export(browser)

    self.assertNotIn('<h3>', exported)
    self.assertIn('<strong>Config</strong>', exported)
    self.assertIn('type Config =', exported)

  def test_unrelated_html_comments_literals_and_wrappers_are_retained_byte_for_byte(self):
    browser = self.browser([{'mode': 'type', 'name': 'Config'}])
    prefix = '<article data-x="&quot;"><section><p>Untouched &amp; text</p>'
    suffix = '</section><footer>Footer</footer></article>'
    literal = '<pre><code>&lt;section class="si-docs-api" data-api-symbol="missing"&gt;</code></pre>'
    comment = '<!-- <section class="si-docs-api" data-api-symbol="missing"></section> -->'

    exported = self.export(prefix + browser + suffix + literal + comment)

    self.assertTrue(exported.startswith(prefix))
    self.assertTrue(exported.endswith(suffix + literal + comment))
    self.assertIn('type Config =', exported)
    plain = '<section class="si-docs-api"><section><p>Not a renderer card</p></section></section>'
    self.assertEqual(self.export(plain), plain)

  def test_actual_section_markup_inside_code_is_not_an_api_region(self):
    html = '<pre><code><section class="si-docs-api" data-api-symbol="missing"></section></code></pre>'
    self.assertEqual(self.export(html), html)

  def test_export_uses_json_not_browser_card_text_and_escapes_all_literal_code(self):
    prepared = self.data['symbols'][1]['type']
    prepared['documentation'] = [paragraph(fragment('<script>alert(1)</script>')),
                                 {'kind': 'code', 'parts': [fragment('<section>&literal</section>')]}]
    browser = self.browser([{'mode': 'type', 'name': 'Config'}])
    browser = browser.replace('&lt;script&gt;alert(1)&lt;/script&gt;', 'Wrong browser content')

    exported = self.export(browser)

    self.assertNotIn('<script>', exported)
    self.assertIn('&lt;script&gt;alert(1)&lt;/script&gt;', exported)
    self.assertIn('<pre><code>&lt;section&gt;&amp;literal&lt;/section&gt;</code></pre>', exported)
    self.assertNotIn('Wrong browser content', exported)

  def test_dangling_browser_anchors_fail_instead_of_inventing_local_targets(self):
    browser = self.browser([{'mode': 'type', 'name': 'Config'}]).replace('id="config"', 'id="missing"')
    with self.assertRaisesRegex(ApiRenderError, 'no existing browser anchor'):
      self.export(browser)

  def test_page_local_resolution_does_not_leak_into_a_subsequent_export(self):
    self.export(self.browser([{'mode': 'api', 'name': 'Widget'}, {'mode': 'types'}]))

    exported = self.export(self.browser([{'mode': 'api', 'name': 'Widget'}]))

    self.assertIn('https://docs.example/element/api/Config/#config', Html(exported).links)
    self.assertNotIn('https://docs.example/element/components/widget/#config', Html(exported).links)

  def test_reused_renderer_has_no_occurrence_state_between_pages(self):
    renderer = ApiRenderer(self.data)
    before = deepcopy(self.data)
    requests = [{'mode': 'api', 'name': 'Widget'}, {'mode': 'types'}]
    local = preprocess_api(self.browser(requests), self.data, 'one/index.md',
                           'https://docs.example/', renderer=renderer)
    external = preprocess_api(self.browser(requests[:1]), self.data, 'two/index.md',
                              'https://docs.example/', renderer=renderer)

    self.assertIn('https://docs.example/one/#config', Html(local).links)
    self.assertIn('https://docs.example/api/Config/#config', Html(external).links)
    self.assertNotIn('https://docs.example/one/#config', Html(external).links)
    self.assertEqual(renderer.adapter.data, before)

  def test_native_converter_preserves_injected_absolute_html_urls_and_literal_code(self):
    repository = Path(__file__).resolve().parents[3]
    with TemporaryDirectory() as directory:
      root = Path(directory)
      (root / 'docs/api').mkdir(parents=True)
      self.data['symbols'][0]['api']['documentation'].append(paragraph(fragment('Local input', 'widget.value')))
      self.data['symbols'][1]['type']['documentation'].append(paragraph({
        'kind': 'link', 'text': 'Widget', 'targetId': None, 'href': '../index.md#widget',
      }))
      browser = self.browser([{'mode': 'api', 'name': 'Widget'}], source='index.md')
      alias = self.browser([{'mode': 'type', 'name': 'Config'}], source='api/Config.md')
      (root / 'docs/index.md').write_text('# Widget API\n\n' + browser)
      (root / 'docs/api/Config.md').write_text('# Configuration\n\n' + alias)
      (root / 'api.json').write_text(json.dumps(self.data))
      (root / 'preprocess.py').write_text(
        'import json\nfrom pathlib import Path\n'
        'from md_extension_element_api.renderer import ApiRenderer\n'
        'from md_extension_element_api.structured import preprocess_api\n'
        f'data = json.loads(Path({str(root / "api.json")!r}).read_text())\n'
        'renderer = ApiRenderer(data)\n'
        'def preprocess(html, output):\n'
        '  return preprocess_api(html, data, output, "https://docs.example/element/", renderer=renderer)\n'
      )
      (root / 'mkdocs.yml').write_text(json.dumps({
        'site_name': 'Structured API native fixture', 'site_url': 'https://docs.example/element/',
        'docs_dir': 'docs', 'site_dir': 'site',
        'plugins': [{'llmstxt': {'sections': {'API': ['index.md', 'api/Config.md']},
                                'preprocess': str(root / 'preprocess.py')}}],
      }))

      result = subprocess.run(
        ['uv', 'run', '--no-sync', 'zensical', 'build', '--strict', '--config-file', str(root / 'mkdocs.yml')],
        cwd=repository, env={**os.environ, 'ELEMENT_DOCS_API': 'false'}, capture_output=True, text=True, timeout=90)

      self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
      exported = (root / 'site/index.md').read_text()
      exported_alias = (root / 'site/api/Config/index.md').read_text()
      self.assertIn('https://docs.example/element/api/Config/#config', exported)
      self.assertNotIn('https://docs.example/element/api/Config/index.md#config', exported)
      self.assertIn('https://docs.example/element/#widget-value', exported)
      self.assertNotIn('https://docs.example/element/index.md#widget-value', exported)
      self.assertIn('type Config = Record<string, "<literal>">', exported_alias)
      self.assertIn('https://docs.example/element/#widget', exported_alias)
      self.assertIn('| Name | Type | Default | Description |', exported)
      self.assertIn('run(value: string): Config', exported)
      self.assertIn('run(value: Config): Config', exported)

  def test_table_properties_with_call_signatures_export_details_outside_the_table(self):
    call = deepcopy(self.data['symbols'][0]['api']['groups'][1]['rows'][0])
    self.data['symbols'][0]['api']['groups'] = [{
      'kind': 'properties', 'title': 'Properties', 'showDefaults': False, 'rows': [call],
    }]
    browser = self.browser([{'mode': 'api', 'name': 'Widget'}])

    exported = self.export(browser)

    self.assertIn('</table>\n<h5>run</h5><section id="widget-run-1">', exported)
    self.assertEqual(set(Html(browser).ids), set(Html(exported).ids))

  def test_empty_or_non_api_content_does_not_require_an_api_artifact(self):
    for html in ('', '<p>Ordinary documentation</p>', '<code>data-api-symbol</code>'):
      with self.subTest(html=html):
        self.assertEqual(preprocess_api(html, {}, 'index.md', 'https://docs.example/'), html)

  def test_explicit_external_and_local_prepared_links_are_absolute_and_safe(self):
    doc = self.data['symbols'][1]['type']['documentation']
    doc[:] = [paragraph({'kind': 'link', 'text': 'External', 'targetId': None, 'href': 'https://other.example/?a=1&b=2'},
                        {'kind': 'link', 'text': 'Local', 'targetId': None, 'href': '#config'})]
    exported = self.export(self.browser([{'mode': 'type', 'name': 'Config'}]))
    self.assertIn('https://other.example/?a=1&b=2', Html(exported).links)
    self.assertIn('https://docs.example/element/components/widget/#config', Html(exported).links)
    doc[0]['parts'][0]['href'] = 'javascript:alert(1)'
    with self.assertRaisesRegex(ApiRenderError, 'Unsafe'):
      self.browser([{'mode': 'type', 'name': 'Config'}])

  def test_relative_markdown_links_resolve_from_source_not_browser_directory(self):
    cases = (
      ('components/widget.md', 'components/widget/index.md', 'guide.md', 'components/guide/'),
      ('components/widget.md', 'components/widget/index.md', '../guide.md', 'guide/'),
      ('components/widget.md', 'components/widget/index.md', './index.md#overview', 'components/#overview'),
      ('components/index.md', 'components/index.md', 'guide.md?mode=all#usage', 'components/guide/?mode=all#usage'),
      ('index.md', 'index.md', 'guide.md', 'guide/'),
      ('index.md', 'index.md', 'index.md#overview', '#overview'),
      ('api/widgets/Widget.md', 'api/widgets/Widget/index.md', '../../guides/index.md#usage', 'guides/#usage'),
      ('api/widgets/index.md', 'api/widgets/index.md', '../Config.md', 'api/Config/'),
    )
    for source, output, href, expected in cases:
      with self.subTest(source=source, output=output, href=href):
        self.data['symbols'][1]['type']['documentation'] = [paragraph({
          'kind': 'link', 'text': 'Guide', 'targetId': None, 'href': href,
        })]
        browser = self.browser([{'mode': 'type', 'name': 'Config'}], source=source)

        exported = self.export(browser, output)

        self.assertIn('https://docs.example/element/' + expected, Html(exported).links)

  def test_member_relative_links_and_source_urls_use_the_occurrence_source_identity(self):
    run = self.data['members']['run-selection']['view']['groups'][0]['rows'][0]
    run['sourceUrl'] = '../sources/widget.ts#L5'
    run['documentation'] = [paragraph({
      'kind': 'link', 'text': 'Guide', 'targetId': None, 'href': 'guide.md',
    })]
    browser = self.browser([{'mode': 'type', 'name': 'Widget.run'}], source='components/widget.md')
    browser += self.browser([{'mode': 'type', 'name': 'Widget.run'}], source='api/generated/Widget.md')

    exported = self.export(browser)

    for expected in ('components/guide/', 'api/generated/guide/', 'sources/widget.ts#L5', 'api/sources/widget.ts#L5'):
      self.assertIn('https://docs.example/element/' + expected, Html(exported).links)

  def test_relative_symbol_source_url_and_absolute_markdown_urls_keep_their_identity(self):
    config = self.data['symbols'][1]
    config['sourceUrl'] = './sources/config.ts#L3'
    config['type']['documentation'] = [paragraph({
      'kind': 'link', 'text': 'External Markdown', 'targetId': None,
      'href': 'https://external.example/reference.md#section',
    }, {'kind': 'link', 'text': 'Root-relative guide', 'targetId': None, 'href': '/guide.md#usage'})]

    exported = self.export(self.browser([{'mode': 'type', 'name': 'Config'}]))

    self.assertIn('https://docs.example/element/components/sources/config.ts#L3', Html(exported).links)
    self.assertIn('https://external.example/reference.md#section', Html(exported).links)
    self.assertIn('https://docs.example/guide/#usage', Html(exported).links)

  def test_fragment_only_links_use_actual_page_url_and_existing_browser_anchor(self):
    self.data['symbols'][1]['type']['documentation'] = [paragraph({
      'kind': 'link', 'text': 'Local', 'targetId': None, 'href': '#config--2',
    })]
    browser = self.browser([{'mode': 'type', 'name': 'Config'}], reserved=['config'], source='api/Config.md')

    exported = self.export(browser, 'preview.md')

    self.assertIn('config--2', Html(browser).ids)
    self.assertIn('https://docs.example/element/preview.html#config--2', Html(exported).links)
    self.assertNotIn('https://docs.example/element/api/Config/#config--2', Html(exported).links)


if __name__ == '__main__':
  unittest.main()
