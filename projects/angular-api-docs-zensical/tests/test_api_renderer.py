"""Unit tests for compact 2-column API table rendering without tabs."""

import re

import markdown

from siemens_angular_api_docs_zensical.renderer import ApiRenderer
from siemens_angular_api_docs_zensical.schema import SCHEMA_VERSION
from siemens_angular_api_docs_zensical.structured import preprocess_api


def _frag(text, kind='code', target_id=None, href=None):
  return {'kind': kind, 'text': text, 'targetId': target_id, 'href': href}


def _para(*parts):
  return {'kind': 'paragraph', 'parts': list(parts)}


def _base_artifact(symbols, targets):
  return {
    'schemaVersion': SCHEMA_VERSION,
    'symbols': symbols,
    'index': {s['name']: [s['id']] for s in symbols},
    'members': {},
    'memberIndex': {},
    'targets': targets,
  }


def test_enum_renders_compact_table_without_tabs():
  enum_symbol = {
    'id': '@test/pkg#Status',
    'name': 'Status',
    'packageName': '@test/pkg',
    'importPath': '@test/pkg',
    'importStatement': "import { Status } from '@test/pkg';",
    'kind': 'enum',
    'referencePath': 'api/types/Status.md',
    'sourceUrl': None,
    'metadata': [],
    'api': {
      'documentation': [_para(_frag('Lifecycle status.', 'text'))],
      'declaration': [_frag('enum Status')],
      'groups': [
        {
          'kind': 'members',
          'title': 'Members',
          'showDefaults': True,
          'rows': [
            {
              'id': '@test/pkg#Status.Active',
              'name': 'Active',
              'badges': [],
              'type': [_frag("'active'")],
              'default': "'active'",
              'documentation': [_para(_frag('Currently active.', 'text'))],
              'signatures': [],
              'sourceUrl': None,
            },
            {
              'id': '@test/pkg#Status.Archived',
              'name': 'Archived',
              'badges': ['deprecated'],
              'type': [_frag("'archived'")],
              'default': "'archived'",
              'documentation': [_para(_frag('No longer used.', 'text'))],
              'signatures': [],
              'sourceUrl': None,
            },
          ],
        }
      ],
      'signatures': [],
      'relatedTypeIds': [],
    },
    'type': {
      'documentation': [_para(_frag('Lifecycle status.', 'text'))],
      'declaration': [_frag('enum Status')],
      'groups': [
        {
          'kind': 'members',
          'title': 'Members',
          'showDefaults': True,
          'rows': [
            {
              'id': '@test/pkg#Status.Active',
              'name': 'Active',
              'badges': [],
              'type': [_frag("'active'")],
              'default': "'active'",
              'documentation': [_para(_frag('Currently active.', 'text'))],
              'signatures': [],
              'sourceUrl': None,
            },
            {
              'id': '@test/pkg#Status.Archived',
              'name': 'Archived',
              'badges': ['deprecated'],
              'type': [_frag("'archived'")],
              'default': "'archived'",
              'documentation': [_para(_frag('No longer used.', 'text'))],
              'signatures': [],
              'sourceUrl': None,
            },
          ],
        }
      ],
      'signatures': [],
      'relatedTypeIds': [],
    },
  }
  targets = {
    '@test/pkg#Status': {'symbolId': '@test/pkg#Status', 'anchor': 'Status'},
    '@test/pkg#Status.Active': {'symbolId': '@test/pkg#Status', 'anchor': 'Status.Active'},
    '@test/pkg#Status.Archived': {'symbolId': '@test/pkg#Status', 'anchor': 'Status.Archived'},
  }
  renderer = ApiRenderer(_base_artifact([enum_symbol], targets))
  html = renderer.for_page('guide.md').render_symbol('Status', mode='type')

  assert 'api-compact-table' in html
  assert 'data-badge="deprecated"' in html
  assert 'Active' in html
  assert 'Archived' in html
  assert 'api-tabs' not in html
  assert 'api-tab-input' not in html
  assert 'api-tab-panel-ts' not in html
  assert 'api-ts-code' not in html


def test_mixed_group_renders_properties_and_methods_in_same_compact_table():
  view = {
    'documentation': [],
    'declaration': [_frag('component PanelComponent')],
    'groups': [
      {
        'kind': 'members',
        'title': 'Attributes and Methods',
        'showDefaults': False,
        'rows': [
          {
            'id': '@test/pkg#PanelComponent.isOpen',
            'name': 'isOpen',
            'badges': ['readonly', 'optional', 'inherited'],
            'type': [_frag('boolean')],
            'default': 'false',
            'documentation': [
              _para(_frag('Whether the panel is expanded.', 'text')),
              _para(_frag('Inherited from ', 'text'), _frag('BasePanel', 'text')),
            ],
            'signatures': [],
            'sourceUrl': 'https://example.com/panel.ts#L10',
          },
          {
            'id': '@test/pkg#PanelComponent.toggle',
            'name': 'toggle',
            'badges': [],
            'type': [],
            'default': None,
            'documentation': [_para(_frag('Toggles the panel state.', 'text'))],
            'signatures': [
              {
                'id': '@test/pkg#PanelComponent.toggle/signature/0',
                'label': [_frag('toggle(force?: boolean): boolean')],
                'documentation': [],
                'parameters': [
                  {
                    'id': '@test/pkg#PanelComponent.toggle/signature/0/parameter/0/force',
                    'name': 'force',
                    'badges': ['optional'],
                    'type': [_frag('boolean')],
                    'default': None,
                    'documentation': [_para(_frag('Explicit target state.', 'text'))],
                    'signatures': [],
                    'sourceUrl': None,
                  }
                ],
                'returns': [_frag('boolean')],
              }
            ],
            'sourceUrl': 'https://example.com/panel.ts#L20',
          },
        ],
      }
    ],
    'signatures': [],
    'relatedTypeIds': [],
  }
  symbol = {
    'id': '@test/pkg#PanelComponent',
    'name': 'PanelComponent',
    'packageName': '@test/pkg',
    'importPath': '@test/pkg',
    'importStatement': "import { PanelComponent } from '@test/pkg';",
    'kind': 'component',
    'referencePath': 'api/PanelComponent.md',
    'sourceUrl': None,
    'metadata': [{'label': 'Selector', 'value': 'test-panel'}],
    'api': view,
    'type': view,
  }
  targets = {
    '@test/pkg#PanelComponent': {'symbolId': '@test/pkg#PanelComponent', 'anchor': 'PanelComponent'},
    '@test/pkg#PanelComponent.isOpen': {'symbolId': '@test/pkg#PanelComponent', 'anchor': 'PanelComponent.isOpen'},
    '@test/pkg#PanelComponent.toggle': {'symbolId': '@test/pkg#PanelComponent', 'anchor': 'PanelComponent.toggle'},
    '@test/pkg#PanelComponent.toggle/signature/0': {
      'symbolId': '@test/pkg#PanelComponent',
      'anchor': 'PanelComponent.toggle--0',
    },
    '@test/pkg#PanelComponent.toggle/signature/0/parameter/0/force': {
      'symbolId': '@test/pkg#PanelComponent',
      'anchor': 'PanelComponent.toggle--0.force',
    },
  }
  renderer = ApiRenderer(_base_artifact([symbol], targets))
  html = renderer.for_page('guide.md').render_symbol('PanelComponent', mode='api')

  # Both property and method render inside the single 2-column compact table.
  tables = re.findall(r'<table\b.*?</table>', html, re.S)
  assert len(tables) == 1
  table = tables[0]
  assert 'isOpen<span class="api-optional" aria-label="optional">?</span>' in table
  assert 'force<span class="api-optional" aria-label="optional">?</span>' in table
  assert 'data-badge="readonly"' in table
  assert 'data-badge="inherited"' in table
  assert 'api-member-origin' in table
  assert 'https://example.com/panel.ts#L10' not in table
  assert 'https://example.com/panel.ts#L20' not in table

  assert '(force?: boolean) =&gt; boolean' in table
  assert 'api-member-meta' in table
  assert 'api-member-type' in table
  assert 'api-signature' not in table
  assert 'api-param-list' in table
  assert 'Explicit target state.' in table
  assert 'Returns:' not in table
  assert 'api-method-list' not in html

  # No tab switcher or synthesized TypeScript panel is rendered.
  assert 'api-tabs' not in html
  assert 'api-tab-input' not in html
  assert 'api-tab-panel-ts' not in html


def test_unified_symbol_card_and_header_for_interfaces_without_tabs():
  def make_iface(name):
    view = {
      'documentation': [],
      'declaration': [_frag(f'interface {name}')],
      'groups': [
        {
          'kind': 'propertys',
          'title': 'Properties',
          'showDefaults': False,
          'rows': [
            {
              'id': f'@test/pkg#{name}.id',
              'name': 'id',
              'badges': [],
              'type': [_frag('string')],
              'default': None,
              'documentation': [],
              'signatures': [],
              'sourceUrl': f'https://example.com/{name.lower()}.ts#L10',
            }
          ],
        }
      ],
      'signatures': [],
      'relatedTypeIds': [],
    }
    return {
      'id': f'@test/pkg#{name}',
      'name': name,
      'packageName': '@test/pkg',
      'importPath': '@test/pkg',
      'importStatement': None,
      'kind': 'interface',
      'referencePath': f'api/{name}.md',
      'sourceUrl': f'https://example.com/{name.lower()}.ts',
      'metadata': [],
      'api': view,
      'type': view,
    }

  symbols = [make_iface('Alpha'), make_iface('Beta')]
  targets = {
    '@test/pkg#Alpha': {'symbolId': '@test/pkg#Alpha', 'anchor': 'Alpha'},
    '@test/pkg#Alpha.id': {'symbolId': '@test/pkg#Alpha', 'anchor': 'Alpha.id'},
    '@test/pkg#Beta': {'symbolId': '@test/pkg#Beta', 'anchor': 'Beta'},
    '@test/pkg#Beta.id': {'symbolId': '@test/pkg#Beta', 'anchor': 'Beta.id'},
  }
  renderer = ApiRenderer(_base_artifact(symbols, targets))
  page = renderer.for_page('guide.md')
  combined = '\n'.join([
    page.render_symbol('Alpha', mode='type'),
    page.render_symbol('Beta', mode='type'),
  ])

  assert combined.count('class="api-symbol-card"') == 2
  assert combined.count('class="api-symbol-header"') == 2
  assert combined.count('class="api-kind"') == 2
  assert 'href="https://example.com/alpha.ts"' in combined
  assert 'href="https://example.com/alpha.ts#L10"' not in combined
  assert 'href="https://example.com/beta.ts#L10"' not in combined
  assert 'api-tabs' not in combined
  assert 'api-tab-input' not in combined
  assert 'api-tab-panel-ts' not in combined


def test_structured_preprocess_handles_mixed_group_with_method_before_property():
  """Regression test: a method sorting alphabetically before a property in a mixed group
  renders in group order inside the unified compact table and preprocess_api matches all anchors."""
  view = {
    'documentation': [],
    'declaration': [_frag('component ChartComponent')],
    'groups': [
      {
        'kind': 'members',
        'title': 'Attributes and Methods',
        'showDefaults': False,
        'rows': [
          {
            'id': '@test/pkg#ChartComponent/member/addSeries',
            'name': 'addSeries',
            'badges': [],
            'type': [],
            'default': None,
            'documentation': [_para(_frag('Adds a data series.', 'text'))],
            'signatures': [
              {
                'id': '@test/pkg#ChartComponent/member/addSeries/signature/0',
                'label': [_frag('addSeries(name: string): void')],
                'documentation': [],
                'parameters': [
                  {
                    'id': '@test/pkg#ChartComponent/member/addSeries/signature/0/parameter/0/name',
                    'name': 'name',
                    'badges': [],
                    'type': [_frag('string')],
                    'default': None,
                    'documentation': [],
                    'signatures': [],
                    'sourceUrl': None,
                  }
                ],
                'returns': [_frag('void')],
              }
            ],
            'sourceUrl': None,
          },
          {
            'id': '@test/pkg#ChartComponent/member/chartContainerWrapper',
            'name': 'chartContainerWrapper',
            'badges': ['readonly'],
            'type': [_frag('ElementRef')],
            'default': None,
            'documentation': [_para(_frag('Wrapper element reference.', 'text'))],
            'signatures': [],
            'sourceUrl': None,
          },
        ],
      }
    ],
    'signatures': [],
    'relatedTypeIds': [],
  }
  symbol = {
    'id': '@test/pkg#ChartComponent',
    'name': 'ChartComponent',
    'packageName': '@test/pkg',
    'importPath': '@test/pkg',
    'importStatement': "import { ChartComponent } from '@test/pkg';",
    'kind': 'component',
    'referencePath': 'api/ChartComponent.md',
    'sourceUrl': None,
    'metadata': [{'label': 'Selector', 'value': 'test-chart'}],
    'api': view,
    'type': view,
  }
  targets = {
    '@test/pkg#ChartComponent': {'symbolId': '@test/pkg#ChartComponent', 'anchor': 'ChartComponent'},
    '@test/pkg#ChartComponent/member/addSeries': {
      'symbolId': '@test/pkg#ChartComponent',
      'anchor': 'ChartComponent.addSeries',
    },
    '@test/pkg#ChartComponent/member/addSeries/signature/0': {
      'symbolId': '@test/pkg#ChartComponent',
      'anchor': 'ChartComponent.addSeries--0',
    },
    '@test/pkg#ChartComponent/member/addSeries/signature/0/parameter/0/name': {
      'symbolId': '@test/pkg#ChartComponent',
      'anchor': 'ChartComponent.addSeries--0.name',
    },
    '@test/pkg#ChartComponent/member/chartContainerWrapper': {
      'symbolId': '@test/pkg#ChartComponent',
      'anchor': 'ChartComponent.chartContainerWrapper',
    },
  }
  data = _base_artifact([symbol], targets)
  renderer = ApiRenderer(data)
  rendered_md = renderer.for_page('api/ChartComponent.md').render_symbol('ChartComponent', mode='api')
  browser_html = markdown.markdown(rendered_md, extensions=['md_in_html', 'attr_list', 'toc'])

  # Browser HTML preserves group row order inside the unified compact table.
  assert browser_html.index('ChartComponent.addSeries') < browser_html.index('ChartComponent.chartContainerWrapper')
  assert 'api-method-list' not in browser_html

  # preprocess_api must discover every browser anchor without raising ApiRenderError.
  structured_html = preprocess_api(
    browser_html,
    data,
    'api/ChartComponent/index.md',
    'https://docs.example/',
    renderer=renderer,
  )
  assert 'id="ChartComponent.chartContainerWrapper"' in structured_html
  assert 'id="ChartComponent.addSeries"' in structured_html
  assert 'Wrapper element reference.' in structured_html
  assert 'Adds a data series.' in structured_html


def test_component_inputs_outputs_and_standalone_type_alias_without_tabs():
  alias_symbol = {
    'id': '@test/pkg#ItemId',
    'name': 'ItemId',
    'packageName': '@test/pkg',
    'importPath': '@test/pkg',
    'importStatement': None,
    'kind': 'type_alias',
    'referencePath': 'api/types/ItemId.md',
    'sourceUrl': None,
    'metadata': [],
    'api': {
      'documentation': [],
      'declaration': [_frag('type ItemId = string | number')],
      'groups': [],
      'signatures': [],
      'relatedTypeIds': [],
    },
    'type': {
      'documentation': [],
      'declaration': [_frag('type ItemId = string | number')],
      'groups': [],
      'signatures': [],
      'relatedTypeIds': [],
    },
  }
  view = {
    'documentation': [],
    'declaration': [_frag('component ItemComponent')],
    'groups': [
      {
        'kind': 'inputs',
        'title': 'Input Properties',
        'showDefaults': True,
        'rows': [
          {
            'id': '@test/pkg#ItemComponent.label',
            'name': 'label',
            'badges': ['required'],
            'type': [_frag('string')],
            'default': None,
            'documentation': [],
            'signatures': [],
            'sourceUrl': None,
          },
          {
            'id': '@test/pkg#ItemComponent.count',
            'name': 'count',
            'badges': [],
            'type': [_frag('number')],
            'default': '42',
            'documentation': [],
            'signatures': [],
            'sourceUrl': None,
          },
        ],
      },
      {
        'kind': 'outputs',
        'title': 'Output Properties',
        'showDefaults': False,
        'rows': [
          {
            'id': '@test/pkg#ItemComponent.selected',
            'name': 'selected',
            'badges': [],
            'type': [_frag('ItemId', 'link', '@test/pkg#ItemId')],
            'default': None,
            'documentation': [],
            'signatures': [],
            'sourceUrl': None,
          },
        ],
      },
    ],
    'signatures': [],
    'relatedTypeIds': ['@test/pkg#ItemId'],
  }
  comp_symbol = {
    'id': '@test/pkg#ItemComponent',
    'name': 'ItemComponent',
    'packageName': '@test/pkg',
    'importPath': '@test/pkg',
    'importStatement': "import { ItemComponent } from '@test/pkg';",
    'kind': 'component',
    'referencePath': 'api/ItemComponent.md',
    'sourceUrl': 'https://example.com/item.ts',
    'metadata': [{'label': 'Selector', 'value': 'test-item'}],
    'api': view,
    'type': view,
  }
  targets = {
    '@test/pkg#ItemId': {'symbolId': '@test/pkg#ItemId', 'anchor': 'ItemId'},
    '@test/pkg#ItemComponent': {'symbolId': '@test/pkg#ItemComponent', 'anchor': 'ItemComponent'},
    '@test/pkg#ItemComponent.label': {'symbolId': '@test/pkg#ItemComponent', 'anchor': 'ItemComponent.label'},
    '@test/pkg#ItemComponent.count': {'symbolId': '@test/pkg#ItemComponent', 'anchor': 'ItemComponent.count'},
    '@test/pkg#ItemComponent.selected': {'symbolId': '@test/pkg#ItemComponent', 'anchor': 'ItemComponent.selected'},
  }
  renderer = ApiRenderer(_base_artifact([alias_symbol, comp_symbol], targets))
  comp_html = renderer.for_page('guide.md').render_symbol('ItemComponent', mode='api')
  alias_html = renderer.for_page('guide.md').render_symbol('ItemId', mode='type')

  assert 'class="api-symbol-card"' in comp_html
  assert 'class="api-symbol-header"' in comp_html
  assert 'class="api-kind"' in comp_html
  assert 'api-compact-table' in comp_html
  assert 'data-badge="required"' in comp_html
  assert re.search(r'<a\b[^>]*href="api/types/ItemId\.md#t:ItemId">ItemId</a>', comp_html)
  assert 'api-tabs' not in comp_html
  assert 'api-tab-input' not in comp_html
  assert 'api-tab-panel-ts' not in comp_html

  assert 'class="api-symbol-card"' in alias_html
  assert 'class="api-ts-code"' in alias_html
  assert 'type ItemId = string | number;' in alias_html
  assert 'api-tabs' not in alias_html
