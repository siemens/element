"""Manual schema2 fixtures: no compiler, JavaScript bridge or TypeScript parsing."""

from copy import deepcopy
from html.parser import HTMLParser
import json
from pathlib import Path
import sys
from tempfile import TemporaryDirectory
from types import SimpleNamespace
import unittest
from unittest.mock import Mock

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from jinja2 import StrictUndefined
from markdown import Markdown
from markdown.preprocessors import Preprocessor
from md_extension_element_api.renderer import ApiRenderer, ApiRenderError
from md_extension_element_api.extension import ElementApiExtension, makeExtension, parse_requests
from md_extension_element_docs.extension import ElementDocsExtension
from md_extension_element_docs_composer.extension import DocsComposerExtension
from md_extension_element_api.validate import validate_pages


def text(value, kind='text', target=None, href=None):
  return {'kind': kind, 'text': value, 'targetId': target, 'href': href}


def paragraph(*parts):
  return {'kind': 'paragraph', 'parts': list(parts)}


def row(node_id, name, type_name='string', **kwargs):
  return {'id': node_id, 'name': name, 'badges': [], 'type': [text(type_name)],
          'default': None, 'documentation': [], 'signatures': [], 'sourceUrl': None, **kwargs}


def view(**kwargs):
  return {'documentation': [], 'declaration': [], 'groups': [], 'signatures': [], 'relatedTypeIds': [], **kwargs}


def symbol(node_id, name, **kwargs):
  return {'id': node_id, 'name': name, 'packageName': '@test/library', 'importPath': '@test/library',
          'importStatement': f"import {{ {name} }} from '@test/library';",
          'kind': 'interface', 'referencePath': f'api/test/{name}.md', 'sourceUrl': None,
          'metadata': [], 'api': view(), 'type': view(), **kwargs}


def fixture():
  widget = symbol('widget', 'Widget', kind='component', metadata=[{'label': 'Selector', 'value': 'test-widget'}])
  widget['api'] = view(
    documentation=[paragraph(text('A prepared '), text('Config', 'link', target='config'))],
    groups=[
      {'kind': 'inputs', 'title': 'Inputs', 'showDefaults': True,
       'rows': [row('widget.value', 'value', 'Config', badges=['required', 'signal'], default="'<unsafe>'",
                    type=[text('Config', 'link', target='config')], documentation=[paragraph(text('Prepared signal input.'))])]},
      {'kind': 'outputs', 'title': 'Outputs', 'showDefaults': False,
       'rows': [row('widget.changed', 'changed', 'Event', badges=['output'], documentation=[paragraph(text('Emitted value.'))])]},
      {'kind': 'methods', 'title': 'Methods', 'showDefaults': False,
       'rows': [row('widget.run', 'run', 'void', signatures=[
         {'id': 'widget.run.1', 'label': [text('run(value: string): void')],
          'documentation': [paragraph(text('First overload.'))],
          'parameters': [row('widget.run.1.value', 'value', documentation=[paragraph(text('First argument.'))])], 'returns': [text('void')]},
         {'id': 'widget.run.2', 'label': [text('run(value: Config): Config')],
          'documentation': [paragraph(text('Second overload.'))],
          'parameters': [row('widget.run.2.value', 'value', 'Config')], 'returns': [text('Config', 'link', target='config')]}
       ])]}
    ], relatedTypeIds=['config', 'other'])
  config = symbol('config', 'Config', type=view(declaration=[text('interface Config')],
    groups=[{'kind': 'properties', 'title': 'Properties', 'showDefaults': False,
             'rows': [row('config.enabled', 'enabled', 'boolean')]}], relatedTypeIds=['other']))
  other = symbol('other', 'Other', type=view(documentation=[paragraph(text('Cycle back to '), text('Config', 'link', target='config'))], relatedTypeIds=['config']))
  widget['type'] = deepcopy(widget['api'])
  symbols = [widget, config, other]
  ids = ['widget', 'widget.value', 'widget.changed', 'widget.run', 'widget.run.1', 'widget.run.2',
         'widget.run.1.value', 'widget.run.2.value', 'config', 'config.enabled', 'other']
  targets = {node_id: {'symbolId': node_id.split('.')[0], 'anchor': 'stable-' + node_id.replace('.', '-')} for node_id in ids}
  index = {}
  for item in symbols:
    for key in (item['name'], item['packageName'] + '#' + item['name'], item['importPath'] + '#' + item['name']):
      index[key] = [item['id']]
  return {'schemaVersion': 2, 'symbols': symbols, 'index': index,
    'members': {'widget.run': {'symbolId': 'widget', 'view': view(groups=[{
      'kind': 'methods', 'title': 'Methods', 'showDefaults': False,
      'rows': [deepcopy(widget['type']['groups'][2]['rows'][0])],
    }], relatedTypeIds=['config', 'other'])}},
    'memberIndex': {'Widget.run': ['widget.run']},
    'targets': targets}


class Html(HTMLParser):
  def __init__(self, source):
    super().__init__()
    self.ids = []
    self.links = []
    self.headers = []
    self.elements = []
    self.stack = []
    self.feed(source)

  def handle_starttag(self, tag, attrs):
    attributes = dict(attrs)
    element = {'tag': tag, 'attrs': attributes, 'ancestors': list(self.stack)}
    self.elements.append(element)
    if tag not in ('area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'):
      self.stack.append(element)
    if 'id' in attributes:
      self.ids.append(attributes['id'])
    if tag == 'a':
      self.links.append(attributes.get('href'))
    if tag == 'th':
      self.headers.append(attributes)

  def handle_endtag(self, tag):
    for index in range(len(self.stack) - 1, -1, -1):
      if self.stack[index]['tag'] == tag:
        del self.stack[index:]
        break


class ApiRendererTests(unittest.TestCase):
  def test_scrollable_tables_are_named_keyboard_groups_not_duplicate_landmarks(self):
    parsed = Html(self.render('<si-docs-api name="Widget"/><si-docs-types/>'))
    groups = [element for element in parsed.elements if element['attrs'].get('class') == 'api-table']

    self.assertTrue(groups)
    for group in groups:
      self.assertEqual(group['attrs']['role'], 'group')
      self.assertEqual(group['attrs']['tabindex'], '0')
      self.assertTrue(group['attrs']['aria-label'])

  def test_api_uses_classless_theme_tables_without_an_outer_layout_table(self):
    html = self.render('<si-docs-api name="Widget"/>')
    parsed = Html(html)
    tables = [element for element in parsed.elements if element['tag'] == 'table']

    self.assertEqual(len(tables), 4)
    self.assertTrue(all('class' not in element['attrs'] for element in tables))
    self.assertTrue(all(element['ancestors'][-1]['attrs'].get('class') == 'api-table' for element in tables))
    self.assertNotIn('type-table', html)
    self.assertNotIn('class="type-header"', html)
    self.assertEqual(html.count('<h3>Widget</h3>'), 1)
    self.assertIn('<dl class="api-metadata"><dt>Selector</dt><dd><code>test-widget</code></dd></dl>', html)
    self.assertIn('<pre class="api-import"><code>import { Widget }', html)
    self.assertEqual(sum(element['tag'] == 'caption' for element in parsed.elements), 4)

  def test_source_links_are_member_names_and_badges_preserve_prepared_values(self):
    item = self.data['symbols'][0]
    item['sourceUrl'] = 'https://example.org/widget.ts#L1'
    item['api']['groups'][0]['rows'][0]['sourceUrl'] = 'https://example.org/widget.ts#L2'
    self.write()
    html = self.render('<si-docs-api name="Widget"/>')
    parsed = Html(html)
    source = next(element for element in parsed.elements if element['attrs'].get('aria-label') == 'Source for value')

    self.assertEqual(source['attrs']['href'], 'https://example.org/widget.ts#L2')
    self.assertEqual(source['ancestors'][-1]['attrs'], {'scope': 'row'})
    self.assertIn('https://example.org/widget.ts#L1', parsed.links)
    self.assertIn('aria-label="Source for value">value</a>', html)
    self.assertNotIn('>Source for value</a>', html)
    self.assertIn('<span class="api-badge" data-badge="required">required</span>', html)
    self.assertIn('<span class="api-badge" data-badge="signal">signal</span>', html)
    self.assertIn('<td><code><a href="../api/test/Config.md#stable-config">Config</a></code></td>', html)

  def test_component_card_groups_its_heading_metadata_and_all_member_entries(self):
    parsed = Html(self.render('<si-docs-api name="Widget"/><si-docs-types/>'))
    card = next(element for element in parsed.elements if element['attrs'].get('class') == 'api-type-card')
    body = next(element for element in parsed.elements if element['attrs'].get('class') == 'api-symbol-body')
    heading = next(element for element in parsed.elements if element['tag'] == 'h3')
    metadata = next(element for element in parsed.elements if element['attrs'].get('class') == 'api-metadata')

    self.assertEqual(body['ancestors'][-1], card)
    self.assertIn(card, heading['ancestors'])
    for element in [metadata, *[element for element in parsed.elements
                                       if element['attrs'].get('id', '').startswith('stable-widget-')]]:
      self.assertIn(body, element['ancestors'])
    config = next(element for element in parsed.elements if element['attrs'].get('id') == 'stable-config')
    self.assertNotIn(card, config['ancestors'])

  def test_component_uses_the_same_source_linked_header_as_types(self):
    self.data['symbols'][0]['sourceUrl'] = 'https://example.org/widget.ts'
    self.write()

    html = self.render('<si-docs-api name="Widget" heading="Widget API"/><si-docs-types/>')
    parsed = Html(html)
    headers = [element for element in parsed.elements if element['attrs'].get('class') == 'api-type-header']

    self.assertEqual(len(headers), 3)
    self.assertTrue(all(element['ancestors'][-1]['attrs'].get('class') == 'api-type-card' for element in headers))
    self.assertIn('<h3><a href="https://example.org/widget.ts" title="Source for Widget">Widget API</a></h3>', html)
    self.assertIn('<span class="api-kind">component</span>', html)
    self.assertNotIn('class="api-source"', html)

  def test_overloads_render_once_inside_members_and_keep_stable_ids(self):
    row = self.data['symbols'][0]['api']['groups'][2]['rows'][0]
    row['documentation'] = [paragraph(text('First overload.'))]
    self.write()
    parsed = Html(self.render('<si-docs-api name="Widget"/>'))
    signatures = [element for element in parsed.elements if element['attrs'].get('id') in ('stable-widget-run-1', 'stable-widget-run-2')]
    member = next(element for element in parsed.elements if element['attrs'].get('id') == 'stable-widget-run')

    self.assertEqual(len(signatures), 2)
    self.assertEqual(member['tag'], 'section')
    self.assertEqual(member['attrs'].get('class'), 'api-member')
    for signature in signatures:
      self.assertEqual(signature['tag'], 'section')
      self.assertEqual(signature['ancestors'][-1]['attrs'].get('class'), 'api-member')
    html = self.render('<si-docs-api name="Widget"/>')
    self.assertEqual(html.count('First overload.'), 1)
    self.assertEqual(html.count('Second overload.'), 1)
    self.assertIn('stable-widget-run', parsed.ids)
    self.assertIn('stable-widget-run-1-value', parsed.ids)
    self.assertIn('stable-widget-run-2-value', parsed.ids)

  def test_member_groups_render_properties_and_methods_without_summary_tables(self):
    owner = self.data['symbols'][0]
    owner['api']['groups'] = [{
      'kind': 'members', 'title': 'Members', 'showDefaults': True,
      'rows': [
        row('widget.timeout', 'timeout', 'number', badges=['required'], default='30',
            sourceUrl='https://example.org/widget.ts#L3', documentation=[paragraph(text('Request timeout.'))]),
        row('widget.convert', 'convert', 'string', badges=['public'],
            sourceUrl='https://example.org/widget.ts#L4', signatures=[{
              'id': 'widget.convert.1', 'label': [text('convert(value: string): string')],
              'documentation': [paragraph(text('Converts the value.'))],
              'parameters': [], 'returns': [text('string')],
            }]),
      ],
    }]
    for node_id in ('widget.timeout', 'widget.convert', 'widget.convert.1'):
      self.data['targets'][node_id] = {'symbolId': 'widget', 'anchor': 'stable-' + node_id.replace('.', '-')}
    self.write()

    html = self.render('<si-docs-api name="Widget"/>')
    parsed = Html(html)
    property_member = next(element for element in parsed.elements if element['attrs'].get('id') == 'stable-widget-timeout')
    property_link = next(element for element in parsed.elements
                         if element['tag'] == 'a' and element['attrs'].get('href') == 'https://example.org/widget.ts#L3')

    self.assertEqual(property_member['tag'], 'section')
    self.assertEqual(property_member['attrs'].get('class'), 'api-member')
    self.assertEqual(property_member['ancestors'][-1]['attrs'].get('class'), 'api-members')
    self.assertIn('<p class="api-group-title"><strong>Members</strong></p>', html)
    self.assertEqual(property_link['attrs'].get('title'), 'Source for timeout')
    self.assertIn('<strong>timeout</strong></a>: <code>number = 30</code>', html)
    self.assertIn('Request timeout.', html)
    self.assertIn('data-badge="required">required</span>', html)
    self.assertIn('https://example.org/widget.ts#L4', parsed.links)
    self.assertIn('data-badge="public">public</span>', html)
    self.assertEqual(html.count('convert(value: string): string'), 1)
    self.assertNotIn('<strong>convert</strong>', html)
    self.assertFalse(any(element['tag'] == 'table' for element in parsed.elements))
    self.assertIn('stable-widget-timeout', parsed.ids)
    self.assertIn('stable-widget-convert', parsed.ids)
    self.assertIn('stable-widget-convert-1', parsed.ids)

  def test_type_card_has_one_header_and_keeps_sources_without_declaration_lines(self):
    self.data['symbols'][1]['sourceUrl'] = 'https://example.org/config.ts'
    self.write()
    html = self.render('<si-docs-type name="Config"/>')

    header = next(element for element in Html(html).elements if element['attrs'].get('class') == 'api-type-header')
    self.assertEqual(header['ancestors'][-1]['attrs'].get('class'), 'api-type-card')
    self.assertIn('title="Source for Config">Config</a>', html)
    self.assertIn('<span class="api-kind">interface</span>', html)
    self.assertNotIn('api-declaration', html)
    self.assertNotIn('interface Config', html)
    self.assertNotIn('type-table', html)
    self.assertEqual(sum(element['tag'] == 'h3' for element in Html(html).elements), 1)
    self.assertNotIn('<h3>', self.render('<si-docs-type name="Config" noHeading="true"/>'))

  def test_api_and_type_cards_omit_type_alias_declaration_lines(self):
    declaration = 'type Config = string & Translatable'
    self.data['symbols'][1]['kind'] = 'type_alias'
    for mode in ('api', 'type'):
      self.data['symbols'][1][mode]['declaration'] = [text(declaration)]
    self.write()

    for tag in ('si-docs-api', 'si-docs-type'):
      with self.subTest(tag=tag):
        html = self.render(f'<{tag} name="Config"/>')
        self.assertNotIn('api-declaration', html)
        self.assertNotIn('type Config =', html)
        self.assertIn('Config', html)

  def test_type_source_link_keeps_the_custom_heading_as_its_accessible_name(self):
    self.data['symbols'][1]['sourceUrl'] = 'https://example.org/config.ts'
    self.write()

    html = self.render('<si-docs-type name="Config" heading="Configuration options"/>')

    self.assertIn('title="Source for Config">Configuration options</a></h3>', html)
    self.assertNotIn('aria-label="Source for Config"', html)

  def test_api_sections_do_not_use_the_themes_icon_class_namespace(self):
    html = self.render('<si-docs-api name="Widget"/><si-docs-type name="Widget.run"/>')

    self.assertEqual(html.count('<section class="si-docs-api no-copy"'), 2)
    self.assertNotIn('<section class="element-', html)

  def test_qualified_member_tags_select_the_prepared_row_and_all_overloads(self):
    html = self.render('<si-docs-type name="Widget.run"></si-docs-type>')
    self.assertIn('First overload.', html)
    self.assertIn('Second overload.', html)
    self.assertNotIn('Prepared signal input.', html)
    self.assertNotIn('import { Widget', html)
    self.assertNotIn('<h3>', html)
    self.assertEqual(Html(html).ids.count('stable-widget-run'), 1)
    self.assertNotIn('stable-widget', Html(html).ids)

  def test_member_api_binding_uses_prepared_alias_and_unwrapped_type(self):
    self.data['memberIndex']['Widget.value'] = ['widget.value.input']
    self.data['members']['widget.value.input'] = {'symbolId': 'widget', 'view': view(groups=[{
      'kind': 'inputs', 'title': 'Inputs', 'showDefaults': True,
      'rows': [row('widget.value', 'publicAlias', type=[text('Config', 'link', target='config')])],
    }], relatedTypeIds=['config', 'other'])}
    self.data['symbols'][0]['type']['groups'][0]['rows'][0]['type'] = [text('InputSignal<Config>')]
    self.write()
    html = self.render('<si-docs-api name="Widget.value"/>')
    self.assertIn('publicAlias', html)
    self.assertNotIn('InputSignal', html)
    html = self.render('<si-docs-type name="Widget.value"/>')
    self.assertIn('publicAlias', html)
    self.assertNotIn('InputSignal', html)
    self.assertIn('InputSignal', self.render('<si-docs-type name="Widget"/>'))

  def test_binding_alias_selectors_distinguish_model_input_and_output_sharing_row_id(self):
    owner = self.data['symbols'][0]
    self.data['members']['widget.model.input'] = {'symbolId': 'widget', 'view': view(groups=[{
      'kind': 'inputs', 'title': 'Inputs', 'showDefaults': True,
      'rows': [row('widget.value', 'publicModel', 'PreparedInputValue')],
    }])}
    self.data['members']['widget.model.output'] = {'symbolId': 'widget', 'view': view(groups=[{
      'kind': 'outputs', 'title': 'Outputs', 'showDefaults': False,
      'rows': [row('widget.value', 'publicModelChange', 'PreparedOutputValue')],
    }])}
    owner['type']['groups'][0]['rows'][0]['type'] = [text('ModelSignal<SourceValue>')]
    for name, selection_id in (('Widget.value', 'widget.model.input'),
        ('Widget.publicModel', 'widget.model.input'), ('Widget.publicModelChange', 'widget.model.output')):
      for key in (name, '@test/library#' + name):
        self.data['memberIndex'][key] = [selection_id]
    self.write()
    for mode in ('api', 'type'):
      for selector in ('name="Widget.publicModelChange"', 'name="Widget.publicModelChange" package="@test/library"', 'name="@test/library#Widget.publicModelChange"'):
        with self.subTest(mode=mode, selector=selector):
          html = self.render(f'<si-docs-{mode} {selector}/>')
          self.assertIn('publicModelChange', html)
          self.assertIn('PreparedOutputValue', html)
          self.assertNotIn('PreparedInputValue', html)
          self.assertNotIn('ModelSignal', html)
          self.assertEqual(Html(html).ids.count('stable-widget-value'), 1)
      for name in ('Widget.value', 'Widget.publicModel'):
        html = self.render(f'<si-docs-{mode} name="{name}"/>')
        self.assertIn('PreparedInputValue', html)
        self.assertNotIn('PreparedOutputValue', html)
    self.assertIn('ModelSignal', self.render('<si-docs-type name="Widget"/>'))

  def test_repeated_members_and_cycles_use_owner_identity_and_valid_local_links(self):
    self.data['members']['widget.run']['view']['groups'][0]['rows'][0]['documentation'] = [
      paragraph(text('Self', 'link', target='widget.run'))]
    self.write()
    html = self.render('<si-docs-type name="Widget.run"/><si-docs-type name="Widget.run"/><si-docs-types/>')
    parsed = Html(html)
    self.assertEqual(len(parsed.ids), len(set(parsed.ids)))
    self.assertNotIn('stable-widget', parsed.ids)
    self.assertIn('#stable-widget-run', parsed.links)
    self.assertIn('#stable-widget-run--2', parsed.links)
    self.assertEqual(parsed.ids.count('stable-config'), 1)

  def test_native_extension_requires_rendering_context(self):
    md = Markdown(extensions=[ElementApiExtension(artifact_path=self.path, artifact_revision='revision')])
    with self.assertRaisesRegex(ApiRenderError, 'rendering_context'):
      md.reset().convert('<si-docs-api name="Widget"/>')

  def test_nested_wrapper_text_rejected_by_renderer_and_prepublish(self):
    for content in ('before<si-docs-type name="Config"/>', '<si-docs-type name="Config"/>between<si-docs-type name="Other"/>', '<si-docs-type name="Config"/>after'):
      source = '<si-docs-types>' + content + '</si-docs-types>'
      with self.subTest(content=content):
        with self.assertRaisesRegex(ApiRenderError, 'authored content'):
          self.render(source)
        with self.assertRaisesRegex(ApiRenderError, 'authored content'):
          validate_pages(self.data, [{'path': 'docs/test.md', 'content': source}])

  def test_exact_canonical_identity_wins_over_aggregate_package_candidates(self):
    data = fixture()
    canonical = symbol('@test/library#Config', 'Config')
    data['symbols'].append(canonical)
    data['targets'][canonical['id']] = {'symbolId': canonical['id'], 'anchor': 'canonical-config'}
    data['index']['@test/library#Config'] = ['config', canonical['id']]
    self.assertEqual(ApiRenderer(data).adapter.lookup('Config', '@test/library')['id'], canonical['id'])

  def test_immutable_artifacts_are_shared_across_markdown_extension_instances(self):
    first = ElementApiExtension(artifact_path=self.path, artifact_revision='revision')
    second = ElementApiExtension(artifact_path=self.path, artifact_revision='revision')
    self.assertIs(first.renderer(), second.renderer())

  def test_validation_rejects_unknown_or_malformed_tags_without_rendering_source(self):
    data = fixture()
    validate_pages(data, [{'path': 'docs/test.md', 'content': '<si-docs-api name="Widget" />'}])
    with self.assertRaisesRegex(ApiRenderError, 'docs/test.md.*Missing'):
      validate_pages(data, [{'path': 'docs/test.md', 'content': '<si-docs-type name="Missing" />'}])
    with self.assertRaisesRegex(ApiRenderError, 'Mismatched'):
      validate_pages(data, [{'path': 'docs/test.md', 'content': '<si-docs-type name="Config"></si-docs-api>'}])

  def test_composer_receives_original_tags_before_jinja_substitution(self):
    root = Path(self.temporary.name)
    (root / 'docs').mkdir()
    original = '<si-docs-api name="Widget"></si-docs-api>\n'
    (root / 'docs/example.md').write_text(original)
    composer = Mock()
    composer.buildFile.return_value = 'Composer HTML must be discarded'
    bridge = DocsComposerExtension({}, composer)
    extension = ElementApiExtension(artifact_path=self.path, artifact_revision='revision')
    md = Markdown(extensions=[bridge, extension])
    class Context(Preprocessor):
      page = SimpleNamespace(path='example.md')
      config = {'extra': {'element_docs_root': str(root)}, 'docs_dir': 'docs'}
      def run(self, lines):
        return lines
    md.preprocessors.register(Context(md), 'rendering_context', 100)
    rendered = md.convert(original)
    self.assertEqual(composer.buildFile.call_args.args[1:3], (original, 'docs/example.md'))
    self.assertIn('si-docs-api no-copy', rendered)
    self.assertNotIn('Composer HTML must be discarded', rendered)
    self.assertNotIn('<si-docs-api', rendered)

  def test_local_types_do_not_claim_a_public_import(self):
    data = fixture()
    data['symbols'][1]['importStatement'] = None
    rendered = ApiRenderer(data).prepare_page([{'mode': 'type', 'name': 'Config'}], 'example.md', [])[0]
    self.assertNotIn('import { Config }', rendered)

  def setUp(self):
    self.temporary = TemporaryDirectory()
    self.addCleanup(self.temporary.cleanup)
    self.path = Path(self.temporary.name) / 'api.json'
    self.data = fixture()
    self.write()

  def write(self):
    self.path.write_text(json.dumps(self.data), encoding='utf-8')

  def markdown(self, extension, page='components/select.md'):
    md = Markdown(extensions=[extension, 'fenced_code', ElementDocsExtension()])
    class Context(Preprocessor):
      def run(self, lines):
        return lines
    context = Context(md)
    context.page = SimpleNamespace(path=page)
    md.preprocessors.register(context, 'rendering_context', 100)
    return md

  def render(self, source, page='components/select.md'):
    extension = ElementApiExtension(artifact_path=self.path, artifact_revision='revision')
    return self.markdown(extension, page).convert(source)

  def test_prepared_signals_groups_overloads_and_parameters(self):
    html = self.render('<si-docs-api component="Widget"></si-docs-api>')
    for expected in ('Inputs', 'Outputs', 'Methods', 'signal', 'required', 'Prepared signal input.',
                     'First overload.', 'Second overload.', 'First argument.', 'run(value: string): void', 'run(value: Config): Config'):
      self.assertIn(expected, html)
    parsed = Html(html)
    self.assertIn('stable-widget-run-1-value', parsed.ids)
    self.assertIn('stable-widget-run-2-value', parsed.ids)
    self.assertTrue(all(item.get('scope') in ('row', 'col') for item in parsed.headers))
    self.assertIn('<caption>Parameters</caption>', html)
    self.assertEqual(html.count('<th scope="col">Default</th>'), 3)  # Inputs and both parameter tables.

  def test_prepared_transitive_related_types_and_forward_local_links(self):
    html = self.render('<si-docs-api name="Widget" />\n\n<si-docs-types></si-docs-types>')
    parsed = Html(html)
    self.assertEqual(parsed.ids.count('stable-config'), 1)
    self.assertEqual(parsed.ids.count('stable-other'), 1)
    self.assertIn('#stable-config', parsed.links)
    for href in parsed.links:
      if href.startswith('#'):
        self.assertIn(href[1:], parsed.ids)

  def test_explicit_types_are_not_repeated_in_related_types(self):
    html = self.render('<si-docs-api name=Widget></si-docs-api>\n<si-docs-type name=Config></si-docs-type>\n<si-docs-types/>')
    parsed = Html(html)
    self.assertEqual(parsed.ids.count('stable-config'), 1)
    self.assertIn('stable-other', parsed.ids)

  def test_explicit_api_embed_does_not_truncate_a_prepared_type_closure(self):
    # Config's API view is empty, but Widget's prepared closure already includes Other.
    html = self.render('<si-docs-api name=Widget/><si-docs-api name=Config/><si-docs-types/>')
    parsed = Html(html)

    self.assertEqual(parsed.ids.count('stable-config'), 1)
    self.assertEqual(parsed.ids.count('stable-other'), 1)

  def test_repeated_embeds_have_unique_ids_and_occurrence_local_links(self):
    self.data['symbols'][0]['api']['documentation'] = [paragraph(text('value', 'link', target='widget.value'))]
    self.write()
    html = self.render('<si-docs-api name=Widget/>\n<si-docs-api name=Widget/>')
    parsed = Html(html)
    self.assertEqual(len(parsed.ids), len(set(parsed.ids)))
    self.assertIn('stable-widget--2', parsed.ids)
    self.assertIn('#stable-widget-value', parsed.links)
    self.assertIn('#stable-widget-value--2', parsed.links)

  def test_repeated_related_types_have_unique_anchors(self):
    html = self.render('<si-docs-api name=Widget/>\n<si-docs-types/>\n<si-docs-types/>')
    parsed = Html(html)
    self.assertEqual(len(parsed.ids), len(set(parsed.ids)))
    self.assertIn('stable-config--2', parsed.ids)

  def test_native_renderer_emits_source_relative_markdown_links(self):
    parsed = Html(self.render('<si-docs-api name=Widget/>'))
    self.assertIn('../api/test/Config.md#stable-config', parsed.links)

  def test_index_canonical_and_current_pages(self):
    self.data['symbols'][1]['referencePath'] = 'api/test/index.md'
    self.write()
    self.assertIn('../api/test/index.md#stable-config', Html(self.render('<si-docs-api name=Widget/>')).links)
    self.assertIn('api/test/index.md#stable-config', Html(self.render('<si-docs-api name=Widget/>', page='index.md')).links)

  def test_generated_symbol_page_uses_canonical_target_anchors(self):
    html = self.render('<si-docs-type name=Config/>', page='api/test/Config.md')
    self.assertIn('stable-config', Html(html).ids)
    self.assertIn('stable-config-enabled', Html(html).ids)

  def test_unpublished_valid_target_is_text_without_dangling_link(self):
    self.data['symbols'][1]['referencePath'] = None
    self.write()
    html = self.render('<si-docs-api name=Widget/>')
    self.assertIn('Config', html)
    self.assertNotIn('stable-config', Html(html).links)
    self.assertNotIn('<a', html)
    self.assertIn('#stable-config', Html(self.render('<si-docs-api name=Widget/><si-docs-types/>')).links)

  def test_literals_and_live_previews_are_not_parsed(self):
    tag = '<si-docs-api name="Missing"></si-docs-api>'
    source = f'```html\n{tag}\n```\n\n~~~~\n{tag}\n~~~~\n\n    {tag}\n\n`{tag}` and prose\n\n``a\n{tag}\nb``\n\n<si-docs-component>{tag}</si-docs-component>'
    html = self.render(source)
    self.assertIn('&lt;si-docs-api', html)
    self.assertIn(f'<si-docs-component>{tag}</si-docs-component>', html)
    self.assertNotIn('si-docs-api no-copy', html)
    self.assertEqual(parse_requests(source), [])

  def test_inline_literal_does_not_hide_adjacent_real_embed(self):
    html = self.render('`<si-docs-api name=Missing/>`\n\n<si-docs-type name=Config/>')
    self.assertIn('&lt;si-docs-api', html)
    self.assertIn('stable-config', Html(html).ids)

  def test_comments_and_escaped_tags(self):
    self.assertEqual(parse_requests('<!-- <si-docs-api name=Missing/> -->\n\\<si-docs-api name=Missing/>'), [])

  def test_escape_all_prepared_fields_without_safe_html(self):
    item = self.data['symbols'][0]
    item['metadata'][0]['value'] = '"><script>alert(1)</script>'
    item['api']['documentation'] = [paragraph(text('<img src=x onerror=alert(1)>'), text('<strong>', 'code')),
                                    {'kind': 'code', 'parts': [text('<script>code</script>')]}]
    item['api']['groups'][0]['rows'][0]['name'] = '<b>value</b>'
    self.write()
    html = self.render('<si-docs-api name=Widget heading="&lt;script&gt;"/>')
    self.assertNotIn('<script>', html)
    self.assertNotIn('<img', html)
    self.assertNotIn('<b>', html)
    self.assertIn('&lt;script&gt;', html)
    self.assertIn('&lt;unsafe&gt;', html)
    self.assertIs(ApiRenderer(self.data).environment.undefined, StrictUndefined)

  def test_safe_external_links_and_unsafe_schemes(self):
    self.data['symbols'][1]['type']['documentation'] = [paragraph(text('External', 'link', href='https://example.org/?a=1&b=2'))]
    self.write()
    self.assertIn('href="https://example.org/?a=1&amp;b=2"', self.render('<si-docs-type name=Config/>'))
    for url in ('javascript:alert(1)', 'data:text/html,x', '//evil.test', 'https://good.test/\nunsafe', 'https://[invalid'):
      with self.subTest(url=url):
        self.data['symbols'][1]['type']['documentation'][0]['parts'][0]['href'] = url
        with self.assertRaises(ApiRenderError):
          ApiRenderer(self.data).prepare_page([{'mode': 'type', 'name': 'Config'}], 'index.md', [])

  def test_source_urls_are_checked_when_rendered(self):
    for target in (self.data['symbols'][0], self.data['members']['widget.run']['view']['groups'][0]['rows'][0]):
      target['sourceUrl'] = 'javascript:alert(1)'
      name = 'Widget' if target is self.data['symbols'][0] else 'Widget.run'
      with self.subTest(name=name), self.assertRaisesRegex(ApiRenderError, 'Unsafe'):
        ApiRenderer(self.data).prepare_page([{'mode': 'api', 'name': name}], 'index.md', [])
      target['sourceUrl'] = None

  def test_unknown_logical_target_and_malformed_canonical_path(self):
    invalid = deepcopy(self.data)
    invalid['symbols'][0]['api']['documentation'][0]['parts'][1]['targetId'] = 'missing'
    with self.assertRaisesRegex(ApiRenderError, 'Unknown logical API target.*missing'):
      ApiRenderer(invalid).prepare_page([{'mode': 'api', 'name': 'Widget'}], 'index.md', [])
    for path in ('../Config.md', '/api/Config.md', 'https://example.org/Config.md', 'api/Config.md#wrong', 'api/Config.ts', 'api/Config.html', 'api/Config/'):
      with self.subTest(path=path):
        invalid = deepcopy(self.data)
        invalid['symbols'][1]['referencePath'] = path
        with self.assertRaises(ApiRenderError):
          ApiRenderer(invalid)

  def test_artifact_version_must_match_the_producer(self):
    self.data['schemaVersion'] = 1
    with self.assertRaisesRegex(ApiRenderError, 'schemaVersion 2'):
      ApiRenderer(self.data)

  def test_prepared_rows_and_signatures_require_registry_targets(self):
    for node_id in ('widget.run', 'widget.run.1', 'widget.run.1.value'):
      invalid = deepcopy(self.data)
      del invalid['targets'][node_id]
      with self.subTest(node_id=node_id), self.assertRaisesRegex(ApiRenderError, 'target'):
        ApiRenderer(invalid).prepare_page([{'mode': 'api', 'name': 'Widget'}], 'index.md', [])

  def test_invalid_and_ambiguous_tags_have_actionable_page_context(self):
    for source in ('<si-docs-api/>', '<si-docs-api name=Widget component=Widget/>',
                   '<si-docs-type name=Config></si-docs-api>', '<si-docs-api name="Widget>',
                   '<si-docs-api name=Widget>', '<si-docs-api name=Missing/>',
                   '<si-docs-api name=Widget>ignored text</si-docs-api>'):
      with self.subTest(source=source), self.assertRaisesRegex(ApiRenderError, 'components/select.md'):
        self.render(source)
    duplicate = symbol('duplicate', 'Config', packageName='@test/second', importPath='@test/second')
    self.data['symbols'].append(duplicate)
    self.data['targets']['duplicate'] = {'symbolId': 'duplicate', 'anchor': 'stable-duplicate'}
    self.data['index']['Config'].append('duplicate')
    self.write()
    with self.assertRaisesRegex(ApiRenderError, 'Ambiguous.*Add an exact package'):
      self.render('<si-docs-type name=Config/>')
    self.assertIn('stable-config', Html(self.render("<si-docs-type name='Config' package='@test/library'/> ")).ids)

  def test_nested_types_and_legacy_attribute_variants(self):
    html = self.render('<si-docs-api\n directive=Widget noHeading=true package="@test/library"/>\n<si-docs-types>\n<si-docs-type name=Config></si-docs-type>\n</si-docs-types>')
    parsed = Html(html)
    self.assertIn('stable-config', parsed.ids)
    self.assertIn('stable-other', parsed.ids)
    self.assertNotIn('<si-docs-types', html)
    self.assertNotIn('<h3>Widget</h3>', html)

  def test_authored_heading_and_import_path_remain_active(self):
    html = self.render('<si-docs-api injectable="Widget" importPath="@test/library" heading="Authored heading" hideImplicitlyPublic="true"/>')
    self.assertIn('<h3>Authored heading</h3>', html)
    self.assertIn('Prepared signal input.', html)

  def test_protected_source_members_are_not_filtered_from_complete_type_views(self):
    self.data['symbols'][0]['type']['groups'].append({
      'kind': 'properties', 'title': 'Properties', 'showDefaults': False,
      'rows': [row('widget.protected', 'protectedMember', badges=['protected'])],
    })
    self.data['targets']['widget.protected'] = {'symbolId': 'widget', 'anchor': 'stable-widget-protected'}
    self.write()
    html = self.render('<si-docs-type name="Widget" noHeading="true"/>')
    self.assertIn('protectedMember', html)
    self.assertIn('protected', html)
    self.assertNotIn('<h3>', html)

  def test_native_module_factory_requires_serialized_artifact_options(self):
    extension = makeExtension(artifact_path=self.path, artifact_revision='revision')
    self.assertIsInstance(extension, ElementApiExtension)
    with self.assertRaises(TypeError):
      makeExtension(artifact_path=self.path)

  def test_artifact_loaded_once_then_reloaded_on_change(self):
    extension = ElementApiExtension(artifact_path=self.path, artifact_revision='revision')
    first = extension.renderer()
    self.assertIs(first, extension.renderer())
    self.data['symbols'][1]['type']['documentation'] = [paragraph(text('Changed in serve'))]
    self.write()
    self.assertIsNot(first, extension.renderer())
    self.assertIn('Changed in serve', self.markdown(extension).convert('<si-docs-type name=Config/>'))

  def test_authored_anchor_collision_keeps_links_on_valid_occurrence(self):
    html = self.render('<div id="stable-config"></div>\n\n<si-docs-api name=Widget/>\n<si-docs-types/>')
    parsed = Html(html)
    self.assertEqual(len(parsed.ids), len(set(parsed.ids)))
    self.assertIn('stable-config--2', parsed.ids)
    self.assertIn('#stable-config--2', parsed.links)

  def test_missing_artifact_has_an_actionable_diagnostic(self):
    with self.assertRaisesRegex(ApiRenderError, 'Cannot read API artifact'):
      extension = ElementApiExtension(self.path.with_name('missing.json'), 'revision')
      self.markdown(extension).convert('<si-docs-type name=Config/>')

  def test_composer_runs_before_api_renderer(self):
    seen = []
    class Composer(Preprocessor):
      def run(self, lines):
        seen.extend(lines)
        return lines
    extension = ElementApiExtension(artifact_path=self.path, artifact_revision='revision')
    md = self.markdown(extension)
    md.preprocessors.register(Composer(md), 'docscomposer', 31)
    source = '<si-docs-api name=Widget/>'
    self.assertIn('si-docs-api no-copy', md.convert(source))
    self.assertIn(source, seen)
    self.assertFalse(any('si-docs-api no-copy' in line for line in seen))


if __name__ == '__main__':
  unittest.main()
