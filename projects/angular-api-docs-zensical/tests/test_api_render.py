"""Contracts for browser HTML, page outlines, and structured API export."""

from copy import deepcopy
from functools import partial
from html import unescape
import json
from pathlib import Path
import shutil

from markdown import Markdown
import pytest
from zensical.extensions.context import ContextExtension, Page

from docs_fixtures import Html, check_invariants, fixture, group, paragraph, row, symbol, text, view
from md_extension_element_api.renderer import ApiRenderer
from md_extension_element_api.structured import preprocess_api

SITE = 'https://docs.example/design/'
TYPES = {'mode': 'types'}
INPUTS = Path(__file__).parent / 'inputs'
CONFIG_DEFINITION = 'type Config = Record<string, "<literal>">'


def request(mode, name='Widget', **extra):
  return {'mode': mode, 'name': name, **extra}


api = partial(request, 'api')
typ = partial(request, 'type')


def host(*related_ids):
  return (symbol('host', 'Host', kind='component', api=view(relatedTypeIds=list(related_ids))),)


def update_symbol(index=0, **values):
  def mutate(data):
    data['symbols'][index].update(values)
  return mutate


def first_group(name=None, anchor=None):
  def mutate(data):
    for mode in ('api', 'type'):
      groups = data['symbols'][0][mode]['groups']
      groups[0] = group('properties', row('widget.value', name)) if name else {**groups[0], 'kind': 'properties'}
    data['targets']['widget.value']['anchor'] = anchor or data['targets']['widget.value']['anchor']
  return mutate


def more_groups(data):
  groups = data['symbols'][0]['api']['groups']
  groups[1]['kind'] = 'members'
  groups.append(group('outputs', row('widget.changed', 'changed')))
  data['targets']['widget.changed'] = {'symbolId': 'widget', 'anchor': 'Widget.changed'}


def prose_reference(data):
  update_symbol(kind='injectable')(data)
  data['symbols'][1]['type']['documentation'] = [paragraph(text('Uses '), text('Widget', 'link', target='widget'))]


def related_order(data):
  widget_api = data['symbols'][0]['api']
  widget_api['relatedTypeIds'] = ['config', 'dependency', 'alpha']
  widget_api['groups'][0]['rows'][0]['type'].append(text('Alpha', 'link', target='alpha'))


def hide(data):
  widget = data['symbols'][0]
  widget['api']['relatedTypeIds'].append('hidden')
  widget['explicitPublicApi'] = view(groups=widget['api']['groups'][:1], relatedTypeIds=['config'])


def code_example(data):
  data['symbols'][0]['api']['documentation'].append(
    {'kind': 'code', 'language': 'ts', 'parts': [text('const value = `<literal>&`;')]})


def alias_notation(data):
  data['symbols'][1]['type']['declaration'] = [
    text('type Config', 'code'), text(' = ', 'code'), text('Record<string, "<literal>">', 'code')]
  data['symbols'][0]['type']['groups'][0]['rows'][0].update(
    badges=['optional', 'inherited'], type=[text('string | undefined')],
    documentation=[paragraph(text('Inherited from '), text('Config', 'link', target='config'))])


HOST = [api('Host'), api(), TYPES]
PAGE_CASES = [
  # Required and forbidden IDs (in document order), plus browser and export hrefs.
  ('component', (), update_symbol(), [api()], [], ['Widget', 't:Widget', 'Widget_i', 'Widget_a'], [], (), ()),
  ('component_repeats_reserved_ids_groups', (), more_groups, [api(), api(), TYPES], ['t:Config', 'Widget_i'],
   ['Widget_i--2', 'Widget_a', 'Widget_o', 'Widget--2', 'Widget.changed--2', 't:Config--2'],
   [], ('#t:Config--2',), ('page.html#t:Config--2',)),
  ('class_properties_group', (), first_group(), [api()], ['Widget_a'],
   ['Widget_a--2', 'Widget_methods'], [], (), ()),
  ('interface', (), update_symbol(kind='interface'), [api()], [], ['t:Widget', 't:Widget_i', 't:Widget_a'], ['Widget'], (), ()),
  ('type_reserved_ids', (), update_symbol(), [typ(), typ()], ['t:Widget', 't:Widget.publicValue'],
   ['t:Widget--2', 't:Widget.publicValue--2', 't:Widget--3', 't:Widget.publicValue--3'], [], (), ()),
  ('observable_member', (), first_group('value$', 'Widget.value~'), [api(), typ()], ['Widget.value~'],
   ['Widget.value~--2', 't:Widget.value~'], [], ('#Widget.value~--2',), ()),
  ('encoded_anchor', (), first_group('a b', 'Widget.a%20b'), [api(), typ()], [],
   ['Widget.a%20b', 't:Widget.a%20b'], [], ('#Widget.a%2520b', '#t%3AWidget.a%2520b'), ()),
  ('no_heading_and_qualified_member', (), update_symbol(), [typ(no_heading=True), typ('Widget.run')], [],
   ['t:Widget', 't:Widget.run', 't:Widget.run--2'], ['t:Widget.publicValue--2'], (), ()),
  ('types_type_referenced', host('widget'), update_symbol(kind='injectable'), HOST, [], ['t:Widget', 't:Config'], [], (), ()),
  ('types_prose_referenced', host(), prose_reference, HOST, [], ['t:Widget', 't:Config'], [], ('#Widget',), ('page.html#Widget',)),
  ('types_unreferenced', host(), update_symbol(kind='injectable'), HOST, [], ['Widget', 't:Config'], ['t:Widget'], (), ()),
  ('no_types_embed', host('widget'), update_symbol(kind='injectable'), HOST[:2], [], ['Widget'], ['t:Widget', 't:Config'], (), ()),
  ('related_type_order', (symbol('alpha', 'Alpha'), symbol('dependency', 'ADependency')), related_order,
   [api(), api('Config'), TYPES], [], ['t:Config', 'types-documentation', 't:Alpha', 't:ADependency'], ['t:Config--2'], (), ()),
  ('hide_implicitly_public', (symbol('hidden', 'HiddenType'),), hide, [api(hide_implicitly_public=True), TYPES], [],
   ['Widget.publicValue', 't:Config'], ['Widget.run', 't:HiddenType'], (), ()),
]
MARKDOWN_MUTATIONS = {'type_card_alias_and_notation': alias_notation, 'highlighted_code_example': code_example}
MARKDOWN_CASES = sorted(path.stem for path in INPUTS.glob('*.md'))


def export_page(browser, data, renderer=None, **options):
  exported = preprocess_api(browser, data, 'guide/page.md', SITE, renderer=renderer)
  check_invariants(browser, exported, **options)
  if renderer:  # a shared renderer must not leak this page's collision-adjusted anchors into the next page
    other, = renderer.prepare_page([api()], 'next/page.md', [])
    assert Html(preprocess_api(other, data, 'next/page.md', SITE, renderer=renderer)).ids == Html(other).ids
  return exported


def toc_lines(tokens, depth=0):
  return ''.join(f'{"  " * depth}- {item["name"]} #{item["id"]}\n' + toc_lines(item['children'], depth + 1) for item in tokens)


@pytest.mark.parametrize('extra, mutate, requests, reserved, present, absent, browser_links, export_links',
                         [pytest.param(*fields, id=name) for name, *fields in PAGE_CASES])
def test_prepared_page(extra, mutate, requests, reserved, present, absent, browser_links, export_links):
  data = fixture(*extra)
  mutate(data)
  renderer = ApiRenderer(data)
  browser = '\n'.join(renderer.prepare_page(deepcopy(requests), 'guide/page.md', reserved))
  exported = export_page(browser, data, renderer=renderer)
  page = Html(browser)
  assert [anchor for anchor in page.ids if anchor in present] == present
  assert not set(page.ids).intersection([*reserved, *absent])
  assert set(browser_links) <= set(page.links)
  assert set(export_links) <= set(Html(exported).links)


@pytest.mark.parametrize('directory, anchor', [('', 'Config'), ('types/', 't:Config')])
def test_cross_page_links_use_the_canonical_view(directory, anchor):
  data = fixture()
  path = f'api/test/{directory}Config'
  update_symbol(1, kind='undecorated_class', referencePath=f'{path}.md')(data)
  browser, = ApiRenderer(data).prepare_page([api()], 'guide/page.md', [])
  assert f'../{path}.md#{anchor}' in Html(browser).links
  assert f'../{path}/index.html#{anchor}' in Html(export_page(browser, data)).links


@pytest.mark.parametrize('name', MARKDOWN_CASES)
def test_markdown_page(tmp_path, name):
  data = fixture()
  MARKDOWN_MUTATIONS.get(name, update_symbol())(data)
  source = (INPUTS / f'{name}.md').read_text(encoding='utf-8')
  prepared = tmp_path / 'prepared'
  prepared.mkdir()
  (prepared / 'api-documentation.json').write_text(json.dumps(data), encoding='utf-8')
  shutil.copy(INPUTS / 'snippets/embeds.md', tmp_path / 'embeds.md')
  config = {'root_dir': str(tmp_path), 'extra': {'element_docs': {'api': {
    'enabled': True, 'artifact_dir': 'prepared',
  }}}}
  markdown = Markdown(extensions=[
    ContextExtension(page=Page(url='guide/page.html', path='guide/page.md'), config=config),
    'attr_list', 'toc', 'md_in_html', 'pymdownx.highlight', 'pymdownx.superfences', 'pymdownx.blocks.tab',
    'pymdownx.snippets', 'md_extension_element_docs.extension', 'md_extension_element_api.extension',
  ], extension_configs={'pymdownx.snippets': {'base_path': [str(tmp_path)]},
                        'pymdownx.highlight': {'linenums': True, 'linenums_style': 'pymdownx-inline'}})
  browser = markdown.convert(source)
  exported = export_page(browser, data, leftover_tags='NotAnEmbed' in source)
  toc = toc_lines(markdown.toc_tokens)
  if name == 'tabs_nested_type_embed':
    golden = Path(__file__).with_name('goldens') / 'api-tabs.html'
    assert f'<!-- toc\n{toc}-->\n{browser}\n<!-- structured export -->\n{exported}' == golden.read_text(encoding='utf-8')
  elif name == 'snippet_in_tabs_authored_heading':
    assert toc.startswith('- Usage #usage\n- Config #t:Config\n- Code #code\n  - Widget API Documentation #Widget\n')
    assert '#t:Config--2' in Html(browser).links
    assert 'page.html#t:Config--2' in Html(exported).links
  elif name == 'outline_with_empty_types':
    assert toc.endswith('    - Types Documentation #types-documentation\n    - Next example #next-example\n')
    assert CONFIG_DEFINITION in unescape(exported)
  elif name == 'no_heading_outline':
    assert toc == '- Widget #widget\n  - Inputs #Widget_i\n  - Methods #Widget_a\n'
    assert '<h3>Widget</h3>' not in exported
  elif name == 'list_indentation':
    for output in (browser, exported):
      assert output.index('<li>') < output.index('<section ') < output.index('</li>')
  elif name == 'literals_beside_real_embed':
    for output in (browser, exported):
      assert output.count('NotAnEmbed') == 7
      assert '<pre><si-docs-api name=NotAnEmbed/></pre>' in output
      assert '<!-- <si-docs-api name=NotAnEmbed/> -->' in output
      assert 't:Config' in Html(output).ids
  elif name == 'highlighted_code_example':
    assert 'class="linenos"' in browser
    assert 'const value = `<literal>&`;' in unescape(exported)
    assert 'class="linenos"' not in exported
  elif name == 'type_card_alias_and_notation':
    assert '<strong>publicValue</strong>?: <code>string</code>' in browser
    assert '<code>string | undefined</code>' in exported
    assert 'Inherited from <a href="page.html#t:Config">Config</a>' in exported
    assert CONFIG_DEFINITION in unescape(exported)
  else:
    pytest.fail(f'Missing expectations for {name}')


def test_export_ignores_tampered_browser_html():
  data = fixture()
  data['symbols'][1]['type']['documentation'] = [paragraph(text('Prepared description.'))]
  browser, = ApiRenderer(data).prepare_page([typ('Config')], 'index.md', [])
  tampered = browser.replace('Record&lt;string,', 'Wrong&lt;string,').replace('Prepared description.', 'Wrong content.')
  exported = preprocess_api(tampered, data, 'index.md', SITE)
  assert 'type Config = Record<string, "<literal>">' in unescape(exported) and 'Prepared description.' in exported
  assert 'Wrong' not in exported
