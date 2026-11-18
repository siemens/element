"""Rendered API pages, snapshotted as browser HTML plus structured export."""

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
  ('component', (), update_symbol(), [api()], []),
  ('component_repeats_reserved_ids_groups', (), more_groups, [api(), api(), TYPES], ['t:Config', 'Widget_i']),
  ('class_properties_group', (), first_group(), [api()], ['Widget_a']),
  ('interface', (), update_symbol(kind='interface'), [api()], []),
  ('type_reserved_ids', (), update_symbol(), [typ(), typ()], ['t:Widget', 't:Widget.publicValue']),
  ('observable_member', (), first_group('value$', 'Widget.value~'), [api(), typ()], ['Widget.value~']),
  ('encoded_anchor', (), first_group('a b', 'Widget.a%20b'), [api(), typ()], []),
  ('no_heading_and_qualified_member', (), update_symbol(), [typ(no_heading=True), typ('Widget.run')], []),
  ('cross_page_class', (), update_symbol(1, kind='undecorated_class', referencePath='api/test/Config.md'), [api()], []),
  ('cross_page_type_view', (), update_symbol(1, kind='undecorated_class', referencePath='api/test/types/Config.md'), [api()], []),
  ('types_type_referenced', host('widget'), update_symbol(kind='injectable'), HOST, []),
  ('types_prose_referenced', host(), prose_reference, HOST, []),
  ('types_unreferenced', host(), update_symbol(kind='injectable'), HOST, []),
  ('no_types_embed', host('widget'), update_symbol(kind='injectable'), HOST[:2], []),
  ('related_type_order', (symbol('alpha', 'Alpha'), symbol('dependency', 'ADependency')), related_order, [api(), api('Config'), TYPES], []),
  ('hide_implicitly_public', (symbol('hidden', 'HiddenType'),), hide, [api(hide_implicitly_public=True), TYPES], []),
]
MARKDOWN_MUTATIONS = {'type_card_alias_and_notation': alias_notation, 'highlighted_code_example': code_example}
MARKDOWN_CASES = sorted(path.stem for path in INPUTS.glob('*.md'))


def snapshot(browser, data, html_snapshot, head='', renderer=None, **options):
  exported = preprocess_api(browser, data, 'guide/page.md', SITE, renderer=renderer)
  check_invariants(browser, exported, **options)
  if renderer:  # a shared renderer must not leak this page's collision-adjusted anchors into the next page
    other, = renderer.prepare_page([api()], 'next/page.md', [])
    assert Html(preprocess_api(other, data, 'next/page.md', SITE, renderer=renderer)).ids == Html(other).ids
  assert f'{head}{browser}\n<!-- structured export -->\n{exported}' == html_snapshot


def toc_lines(tokens, depth=0):
  return ''.join(f'{"  " * depth}- {item["name"]} #{item["id"]}\n' + toc_lines(item['children'], depth + 1) for item in tokens)


@pytest.mark.parametrize('extra, mutate, requests, reserved', [case[1:] for case in PAGE_CASES], ids=[case[0] for case in PAGE_CASES])
def test_prepared_page(html_snapshot, extra, mutate, requests, reserved):
  data = fixture(*extra)
  mutate(data)
  renderer = ApiRenderer(data)
  snapshot('\n'.join(renderer.prepare_page(deepcopy(requests), 'guide/page.md', reserved)), data, html_snapshot, renderer=renderer)


@pytest.mark.parametrize('name', MARKDOWN_CASES)
def test_markdown_page(html_snapshot, tmp_path, name):
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
  snapshot(browser, data, html_snapshot, f'<!-- toc\n{toc_lines(markdown.toc_tokens)}-->\n', leftover_tags='NotAnEmbed' in source)


def test_export_ignores_tampered_browser_html():
  data = fixture()
  data['symbols'][1]['type']['documentation'] = [paragraph(text('Prepared description.'))]
  browser, = ApiRenderer(data).prepare_page([typ('Config')], 'index.md', [])
  tampered = browser.replace('Record&lt;string,', 'Wrong&lt;string,').replace('Prepared description.', 'Wrong content.')
  exported = preprocess_api(tampered, data, 'index.md', SITE)
  assert 'type Config = Record<string, "<literal>">' in unescape(exported) and 'Prepared description.' in exported
  assert 'Wrong' not in exported
