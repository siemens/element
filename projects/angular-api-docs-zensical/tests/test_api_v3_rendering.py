"""Targeted tests for V3 code-first signature overview and compact linked member list."""

import re

from siemens_angular_api_docs_zensical.renderer import ApiRenderer
from siemens_angular_api_docs_zensical.schema import SCHEMA_VERSION
from siemens_angular_api_docs_zensical.structured import preprocess_api


def _frag(text, kind='code', target_id=None, href=None):
  return {'kind': kind, 'text': text, 'targetId': target_id, 'href': href}


def _para(text):
  return {'kind': 'paragraph', 'parts': [_frag(text, kind='text')]}


def _make_artifact():
  symbols = [
    {
      'id': 'pkg#MyCardComponent',
      'name': 'MyCardComponent',
      'kind': 'component',
      'importPath': 'pkg',
      'importStatement': "import { MyCardComponent } from 'pkg';",
      'referencePath': 'api/pkg/components/MyCardComponent.md',
      'sourceUrl': 'https://example.com/card.ts#L1',
      'metadata': [{'label': 'Selector', 'value': 'my-card'}],
      'api': {
        'documentation': [_para('Displays a card container.')],
        'declaration': [_frag('component MyCardComponent')],
        'signatures': [],
        'relatedTypeIds': ['pkg#CardTone'],
        'groups': [
          {
            'kind': 'inputs',
            'title': 'Input Properties',
            'showDefaults': True,
            'rows': [
              {
                'id': 'pkg#MyCardComponent.heading',
                'name': 'heading',
                'badges': ['required'],
                'type': [_frag('string')],
                'default': None,
                'documentation': [_para('Card heading text.')],
                'signatures': [],
                'sourceUrl': 'https://example.com/card.ts#L10',
              },
              {
                'id': 'pkg#MyCardComponent.tone',
                'name': 'tone',
                'badges': [],
                'type': [_frag('CardTone', kind='link', target_id='pkg#CardTone')],
                'default': "'neutral'",
                'documentation': [_para('Visual tone.')],
                'signatures': [],
                'sourceUrl': 'https://example.com/card.ts#L15',
              },
            ],
          },
          {
            'kind': 'outputs',
            'title': 'Output Properties',
            'showDefaults': False,
            'rows': [
              {
                'id': 'pkg#MyCardComponent.closed',
                'name': 'closed',
                'badges': [],
                'type': [_frag('void')],
                'default': None,
                'documentation': [_para('Emitted when closed.')],
                'signatures': [],
                'sourceUrl': 'https://example.com/card.ts#L20',
              },
            ],
          },
          {
            'kind': 'members',
            'title': 'Attributes and Methods',
            'showDefaults': False,
            'rows': [
              {
                'id': 'pkg#MyCardComponent.focus',
                'name': 'focus',
                'badges': [],
                'type': [_frag('(select?: boolean) => boolean')],
                'default': None,
                'documentation': [_para('Focuses the card.')],
                'signatures': [
                  {
                    'id': 'pkg#MyCardComponent.focus/signature/0',
                    'label': [_frag('focus(select?: boolean): boolean')],
                    'documentation': [_para('Focuses the card.')],
                    'parameters': [
                      {
                        'id': 'pkg#MyCardComponent.focus/signature/0/parameter/0/select',
                        'name': 'select',
                        'badges': ['optional'],
                        'type': [_frag('boolean')],
                        'default': 'false',
                        'documentation': [_para('Select content on focus.')],
                        'signatures': [],
                        'sourceUrl': None,
                      },
                    ],
                    'returns': [_frag('boolean')],
                  },
                ],
                'sourceUrl': 'https://example.com/card.ts#L25',
              },
            ],
          },
        ],
      },
      'type': {
        'documentation': [_para('Displays a card container.')],
        'declaration': [_frag('component MyCardComponent')],
        'signatures': [],
        'relatedTypeIds': [],
        'groups': [],
      },
    },
    {
      'id': 'pkg#CardTone',
      'name': 'CardTone',
      'kind': 'type_alias',
      'importPath': 'pkg',
      'importStatement': "import { CardTone } from 'pkg';",
      'referencePath': 'api/pkg/types/CardTone.md',
      'sourceUrl': 'https://example.com/card.ts#L3',
      'metadata': [],
      'api': {
        'documentation': [_para('Supported card tones.')],
        'declaration': [_frag("type CardTone = 'neutral' | 'accent'")],
        'signatures': [],
        'relatedTypeIds': [],
        'groups': [],
      },
      'type': {
        'documentation': [_para('Supported card tones.')],
        'declaration': [_frag("type CardTone = 'neutral' | 'accent'")],
        'signatures': [],
        'relatedTypeIds': [],
        'groups': [],
      },
    },
    {
      'id': 'pkg#CardStatus',
      'name': 'CardStatus',
      'kind': 'enum',
      'importPath': 'pkg',
      'importStatement': "import { CardStatus } from 'pkg';",
      'referencePath': 'api/pkg/types/CardStatus.md',
      'sourceUrl': None,
      'metadata': [],
      'api': {
        'documentation': [_para('Lifecycle status.')],
        'declaration': [_frag('enum CardStatus')],
        'signatures': [],
        'relatedTypeIds': [],
        'groups': [
          {
            'kind': 'members',
            'title': 'Members',
            'showDefaults': True,
            'rows': [
              {
                'id': 'pkg#CardStatus.Active',
                'name': 'Active',
                'badges': [],
                'type': [],
                'default': "'active'",
                'documentation': [_para('Active state.')],
                'signatures': [],
                'sourceUrl': None,
              },
            ],
          },
        ],
      },
      'type': {
        'documentation': [_para('Lifecycle status.')],
        'declaration': [_frag('enum CardStatus')],
        'signatures': [],
        'relatedTypeIds': [],
        'groups': [
          {
            'kind': 'members',
            'title': 'Members',
            'showDefaults': True,
            'rows': [
              {
                'id': 'pkg#CardStatus.Active',
                'name': 'Active',
                'badges': [],
                'type': [],
                'default': "'active'",
                'documentation': [_para('Active state.')],
                'signatures': [],
                'sourceUrl': None,
              },
            ],
          },
        ],
      },
    },
    {
      'id': 'pkg#formatCard',
      'name': 'formatCard',
      'kind': 'function',
      'importPath': 'pkg',
      'importStatement': "import { formatCard } from 'pkg';",
      'referencePath': 'api/pkg/functions/formatCard.md',
      'sourceUrl': None,
      'metadata': [],
      'api': {
        'documentation': [_para('Formats a card label.')],
        'declaration': [_frag('function formatCard')],
        'signatures': [
          {
            'id': 'pkg#formatCard/signature/0',
            'label': [_frag('formatCard(value: string): string')],
            'documentation': [_para('Formats a card label.')],
            'parameters': [
              {
                'id': 'pkg#formatCard/signature/0/parameter/0/value',
                'name': 'value',
                'badges': [],
                'type': [_frag('string')],
                'default': None,
                'documentation': [_para('Raw label.')],
                'signatures': [],
                'sourceUrl': None,
              },
            ],
            'returns': [_frag('string')],
          },
        ],
        'relatedTypeIds': [],
        'groups': [],
      },
      'type': {
        'documentation': [_para('Formats a card label.')],
        'declaration': [_frag('function formatCard')],
        'signatures': [
          {
            'id': 'pkg#formatCard/signature/0',
            'label': [_frag('formatCard(value: string): string')],
            'documentation': [_para('Formats a card label.')],
            'parameters': [
              {
                'id': 'pkg#formatCard/signature/0/parameter/0/value',
                'name': 'value',
                'badges': [],
                'type': [_frag('string')],
                'default': None,
                'documentation': [_para('Raw label.')],
                'signatures': [],
                'sourceUrl': None,
              },
            ],
            'returns': [_frag('string')],
          },
        ],
        'relatedTypeIds': [],
        'groups': [],
      },
    },
    {
      'id': 'pkg#LargeComponent',
      'name': 'LargeComponent',
      'kind': 'component',
      'importPath': 'pkg',
      'importStatement': "import { LargeComponent } from 'pkg';",
      'referencePath': 'api/pkg/components/LargeComponent.md',
      'sourceUrl': None,
      'metadata': [],
      'api': {
        'documentation': [_para('Component with many inputs.')],
        'declaration': [_frag('class LargeComponent')],
        'signatures': [],
        'relatedTypeIds': [],
        'groups': [
          {
            'kind': 'inputs',
            'title': 'Input Properties',
            'showDefaults': False,
            'rows': [
              {
                'id': f'pkg#LargeComponent.prop{index}',
                'name': f'prop{index}',
                'badges': [],
                'type': [_frag('string')],
                'default': None,
                'documentation': [_para(f'Property {index}.')],
                'signatures': [],
                'sourceUrl': None,
              }
              for index in range(16)
            ],
          },
        ],
      },
      'type': {
        'documentation': [_para('Component with many inputs.')],
        'declaration': [_frag('class LargeComponent')],
        'signatures': [],
        'relatedTypeIds': [],
        'groups': [],
      },
    },
  ]
  targets = {
    'pkg#MyCardComponent': {'symbolId': 'pkg#MyCardComponent', 'anchor': 'MyCardComponent'},
    'pkg#MyCardComponent.heading': {'symbolId': 'pkg#MyCardComponent', 'anchor': 'MyCardComponent.heading'},
    'pkg#MyCardComponent.tone': {'symbolId': 'pkg#MyCardComponent', 'anchor': 'MyCardComponent.tone'},
    'pkg#MyCardComponent.closed': {'symbolId': 'pkg#MyCardComponent', 'anchor': 'MyCardComponent.closed'},
    'pkg#MyCardComponent.focus': {'symbolId': 'pkg#MyCardComponent', 'anchor': 'MyCardComponent.focus'},
    'pkg#MyCardComponent.focus/signature/0': {
      'symbolId': 'pkg#MyCardComponent',
      'anchor': 'MyCardComponent.focus.0',
    },
    'pkg#MyCardComponent.focus/signature/0/parameter/0/select': {
      'symbolId': 'pkg#MyCardComponent',
      'anchor': 'MyCardComponent.focus.0.select',
    },
    'pkg#CardTone': {'symbolId': 'pkg#CardTone', 'anchor': 'CardTone'},
    'pkg#CardStatus': {'symbolId': 'pkg#CardStatus', 'anchor': 'CardStatus'},
    'pkg#CardStatus.Active': {'symbolId': 'pkg#CardStatus', 'anchor': 'CardStatus.Active'},
    'pkg#formatCard': {'symbolId': 'pkg#formatCard', 'anchor': 'formatCard'},
    'pkg#formatCard/signature/0': {'symbolId': 'pkg#formatCard', 'anchor': 'formatCard.0'},
    'pkg#formatCard/signature/0/parameter/0/value': {
      'symbolId': 'pkg#formatCard',
      'anchor': 'formatCard.0.value',
    },
    'pkg#LargeComponent': {'symbolId': 'pkg#LargeComponent', 'anchor': 'LargeComponent'},
  }
  for index in range(16):
    targets[f'pkg#LargeComponent.prop{index}'] = {
      'symbolId': 'pkg#LargeComponent',
      'anchor': f'LargeComponent.prop{index}',
    }

  return {
    'schemaVersion': SCHEMA_VERSION,
    'symbols': symbols,
    'index': {symbol['name']: [symbol['id']] for symbol in symbols},
    'members': {},
    'memberIndex': {},
    'targets': targets,
  }


def _markdown_headings_to_html(text):
  return re.sub(
    r'^(#{3,6}) (.+?) \{#([^}]+)\}$',
    lambda m: f'<h{len(m.group(1))} id="{m.group(3)}">{m.group(2)}</h{len(m.group(1))}>',
    text,
    flags=re.M,
  )


def test_component_renders_code_first_skeleton_and_compact_linked_list():
  data = _make_artifact()
  renderer = ApiRenderer(data)
  page = renderer.for_page('guide.md', has_types_section=True)
  html = page.render_symbol('MyCardComponent', mode='api')
  _types_html = page.render_types()

  overview = re.search(r'<pre class="api-code-overview"><code>(.*?)</code></pre>', html, re.S)
  assert overview is not None
  code = overview.group(1)

  # Normalized class declaration, preserved indentation, and grouped comments
  assert code.startswith('class MyCardComponent {\n  <span class="api-code-comment">// Inputs</span>')
  assert '\n  <span class="api-code-comment">// Outputs</span>' in code
  assert '\n  <span class="api-code-comment">// Properties &amp; Methods</span>' in code

  # Clickable member links in code overview match detailed entries in compact list
  for member, anchor in [
    ('heading', 'MyCardComponent.heading'),
    ('tone', 'MyCardComponent.tone'),
    ('closed', 'MyCardComponent.closed'),
    ('focus', 'MyCardComponent.focus'),
  ]:
    assert re.search(
      rf'<a\b[^>]*class="api-code-member-link"[^>]*href="#{re.escape(anchor)}"[^>]*>{re.escape(member)}</a\s*>',
      code,
    )
    assert f'<li id="{anchor}" class="api-member-item">' in html

  # Angular input() / input.required() / output() syntax and clickable type links
  assert re.search(
    r'<a\b[^>]*class="api-code-member-link"[^>]*href="#MyCardComponent\.heading"[^>]*>heading</a\s*> = input\.required&lt;string&gt;\(\);',
    code,
  )
  assert '// required' not in code
  assert re.search(
    r'<a\b[^>]*class="api-code-member-link"[^>]*href="#MyCardComponent\.tone"[^>]*>tone</a\s*> = input&lt;<a href="#t:CardTone">CardTone</a>&gt;\(&#39;neutral&#39;\);',
    code,
  )
  assert re.search(
    r'<a\b[^>]*class="api-code-member-link"[^>]*href="#MyCardComponent\.closed"[^>]*>closed</a\s*> = output&lt;void&gt;\(\);',
    code,
  )

  # Consistent symbol header with kind badge and source link across api and type modes
  assert 'class="api-symbol-header"' in html
  assert 'class="api-symbol-meta"' in html
  assert 'class="api-kind"' in html
  assert 'class="api-type-card"' not in html

  # Compact list replaces HTML tables and preserves Markdown TOC headings & parameters & returns
  assert '<table' not in html
  assert '<ul class="api-member-list"' in html
  assert '#### Input Properties {#MyCardComponent_i}' in html
  assert '#### Output Properties {#MyCardComponent_o}' in html
  assert '#### Attributes and Methods {#MyCardComponent_a}' in html
  assert '<div class="api-param-group" role="group" aria-label="Parameters">' in html
  assert re.search(r'<strong>Returns:\s*</strong\s*>\s*<code[^>]*>\s*boolean\s*</code\s*>', html)

  # llms.txt structured preprocessing still works cleanly on the rendered V3 HTML
  exported = preprocess_api(_markdown_headings_to_html(html), data, 'guide/index.md', 'https://example.com')
  assert 'Displays a card container.' in exported
  assert 'Card heading text.' in exported


def test_simple_type_alias_renders_code_block_and_description_only():
  data = _make_artifact()
  renderer = ApiRenderer(data)
  page = renderer.for_page('guide.md')
  html = page.render_symbol('CardTone', mode='type')

  overview = re.search(r'<pre class="api-code-overview"><code>(.*?)</code></pre>', html, re.S)
  assert overview is not None
  assert overview.group(1) == "type CardTone = &#39;neutral&#39; | &#39;accent&#39;;"
  assert 'Supported card tones.' in html
  assert 'class="api-symbol-header"' in html
  assert 'class="api-kind"' in html
  assert 'api-type-card' not in html
  assert 'api-member-list' not in html


def test_enum_and_function_render_code_first_skeleton():
  data = _make_artifact()
  renderer = ApiRenderer(data)
  page = renderer.for_page('guide.md')
  enum_html = page.render_symbol('CardStatus', mode='type')
  fn_html = page.render_symbol('formatCard', mode='api')

  enum_overview = re.search(r'<pre class="api-code-overview"><code>(.*?)</code></pre>', enum_html, re.S)
  assert enum_overview is not None
  assert 'enum CardStatus {' in enum_overview.group(1)
  assert 'href="#t:CardStatus.Active"' in enum_overview.group(1)
  assert "= &#39;active&#39;," in enum_overview.group(1)
  assert 'class="api-symbol-header"' in enum_html
  assert 'class="api-member-list"' in enum_html
  assert 'api-type-card' not in enum_html

  fn_overview = re.search(r'<pre class="api-code-overview"><code>(.*?)</code></pre>', fn_html, re.S)
  assert fn_overview is not None
  assert 'function <a class="api-code-member-link" href="#t:formatCard.0"' in fn_overview.group(1)
  assert '(value: string): string;' in fn_overview.group(1)
  assert '<table' not in fn_html
  assert '<div class="api-param-group"' in fn_html


def test_large_symbol_wraps_code_overview_in_open_details():
  data = _make_artifact()
  renderer = ApiRenderer(data)
  page = renderer.for_page('guide.md')
  html = page.render_symbol('LargeComponent', mode='api')

  assert '<details class="api-code-overview-details" open>' in html
  assert re.search(
    r'<summary class="api-code-overview-summary">\s*API overview \(16 members\)\s*</summary>',
    html,
  )
  assert 'class="api-code-overview api-code-overview-large"' in html
  assert '= input&lt;string&gt;();' in html
