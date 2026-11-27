"""Unit tests for V2 compact hybrid table, method list, and tabbed TypeScript rendering."""

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


def test_enum_renders_compact_table_and_members_typescript_tabs():
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

  assert 'name="api-tabs-t:Status"' in html
  assert 'for="api-tabs-t:Status-members">Members</label>' in html
  assert 'for="api-tabs-t:Status-ts">TypeScript</label>' in html
  assert 'api-compact-table' in html
  assert 'data-badge="deprecated"' in html
  assert "enum Status {\n  Active = &#39;active&#39;,\n  Archived = &#39;archived&#39;,\n}" in html


def test_mixed_group_splits_properties_into_table_and_methods_into_definition_list():
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

  # Property is in the 2-column compact table, not the method list.
  table_match = re.search(r'<table\b.*?</table>', html, re.S)
  assert table_match is not None
  table = table_match.group(0)
  assert 'isOpen' in table
  assert 'api-optional' in table
  assert 'data-badge="readonly"' in table
  assert 'data-badge="inherited"' in table
  assert 'api-member-origin' in table
  assert 'toggle' not in table

  # Method is in the flat definition list with parameters and returns.
  method_match = re.search(r'<dl class="api-method-list".*?</dl>', html, re.S)
  assert method_match is not None
  methods = method_match.group(0)
  assert 'toggle(force?: boolean): boolean' in methods
  assert 'api-param-list' in methods
  assert 'Explicit target state.' in methods
  assert 'Returns:' in methods

  # TypeScript tab shows valid class declaration.
  assert 'class PanelComponent {' in html
  assert 'readonly isOpen?: boolean = false;' in html
  assert 'toggle(force?: boolean): boolean;' in html


def test_multiple_symbols_on_same_page_get_independent_tab_groups():
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
              'sourceUrl': None,
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
      'sourceUrl': None,
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

  names = set(re.findall(r'name="(api-tabs-[^"]+)"', combined))
  assert names == {'api-tabs-t:Alpha', 'api-tabs-t:Beta'}


def test_structured_preprocess_handles_mixed_group_with_method_before_property():
  """Regression test: a method sorting alphabetically before a property in a mixed group
  renders after the property table in browser HTML; preprocess_api must still match all anchors."""
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

  # Browser HTML renders the flat property table before the method definition list.
  assert browser_html.index('ChartComponent.chartContainerWrapper') < browser_html.index('ChartComponent.addSeries')

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


def test_angular_inputs_and_outputs_use_signal_function_syntax_in_typescript_tab():
  event_symbol = {
    'id': '@test/pkg#ItemEvent',
    'name': 'ItemEvent',
    'packageName': '@test/pkg',
    'importPath': '@test/pkg',
    'importStatement': None,
    'kind': 'interface',
    'referencePath': 'api/types/ItemEvent.md',
    'sourceUrl': None,
    'metadata': [],
    'api': {'documentation': [], 'declaration': [_frag('interface ItemEvent')], 'groups': [], 'signatures': [], 'relatedTypeIds': []},
    'type': {'documentation': [], 'declaration': [_frag('interface ItemEvent')], 'groups': [], 'signatures': [], 'relatedTypeIds': []},
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
          {
            'id': '@test/pkg#ItemComponent.disabled',
            'name': 'disabled',
            'badges': [],
            'type': [_frag('boolean')],
            'default': None,
            'documentation': [],
            'signatures': [],
            'sourceUrl': None,
          },
          {
            'id': '@test/pkg#ItemComponent.untyped',
            'name': 'untyped',
            'badges': [],
            'type': [],
            'default': None,
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
            'type': [_frag('ItemEvent', 'link', '@test/pkg#ItemEvent')],
            'default': None,
            'documentation': [],
            'signatures': [],
            'sourceUrl': None,
          },
          {
            'id': '@test/pkg#ItemComponent.closed',
            'name': 'closed',
            'badges': [],
            'type': [],
            'default': None,
            'documentation': [],
            'signatures': [],
            'sourceUrl': None,
          },
        ],
      },
    ],
    'signatures': [],
    'relatedTypeIds': ['@test/pkg#ItemEvent'],
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
    '@test/pkg#ItemEvent': {'symbolId': '@test/pkg#ItemEvent', 'anchor': 'ItemEvent'},
    '@test/pkg#ItemComponent': {'symbolId': '@test/pkg#ItemComponent', 'anchor': 'ItemComponent'},
    '@test/pkg#ItemComponent.label': {'symbolId': '@test/pkg#ItemComponent', 'anchor': 'ItemComponent.label'},
    '@test/pkg#ItemComponent.count': {'symbolId': '@test/pkg#ItemComponent', 'anchor': 'ItemComponent.count'},
    '@test/pkg#ItemComponent.disabled': {'symbolId': '@test/pkg#ItemComponent', 'anchor': 'ItemComponent.disabled'},
    '@test/pkg#ItemComponent.untyped': {'symbolId': '@test/pkg#ItemComponent', 'anchor': 'ItemComponent.untyped'},
    '@test/pkg#ItemComponent.selected': {'symbolId': '@test/pkg#ItemComponent', 'anchor': 'ItemComponent.selected'},
    '@test/pkg#ItemComponent.closed': {'symbolId': '@test/pkg#ItemComponent', 'anchor': 'ItemComponent.closed'},
  }
  renderer = ApiRenderer(_base_artifact([event_symbol, comp_symbol], targets))
  html = renderer.for_page('guide.md').render_symbol('ItemComponent', mode='api')

  assert 'label = input.required&lt;string&gt;();' in html
  assert 'count = input&lt;number&gt;(42);' in html
  assert 'disabled = input&lt;boolean&gt;();' in html
  assert 'untyped = input();' in html
  assert re.search(r'selected = output&lt;<a\b[^>]*href="api/types/ItemEvent\.md#t:ItemEvent">ItemEvent</a>&gt;\(\);', html)
  assert 'closed = output();' in html
  assert 'class="api-symbol-card"' in html
  assert 'class="api-kind"' in html
  assert '>Members</label>' in html
