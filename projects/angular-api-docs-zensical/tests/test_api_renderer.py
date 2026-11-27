"""Unit tests for ApiRenderer V1 unified property list and type declaration headers."""

import re

from siemens_angular_api_docs_zensical.renderer import ApiRenderer
from siemens_angular_api_docs_zensical.schema import SCHEMA_VERSION


def _frag(text, kind='code', target_id=None, href=None):
  return {'kind': kind, 'text': text, 'targetId': target_id, 'href': href}


def _para(*parts):
  return {'kind': 'paragraph', 'parts': list(parts)}


def _empty_view(**overrides):
  base = {
    'documentation': [],
    'declaration': [],
    'groups': [],
    'signatures': [],
    'relatedTypeIds': [],
  }
  base.update(overrides)
  return base


def _build_artifact():
  bar_id = 'pkg#Bar'
  foo_id = 'pkg#Foo'
  enum_id = 'pkg#Status'
  alias_id = 'pkg#Size'
  comp_id = 'pkg#DemoComponent'
  service_id = 'pkg#DemoService'
  const_id = 'pkg#DEFAULT_SIZE'
  fn_id = 'pkg#formatSize'

  foo_view = _empty_view(
    documentation=[_para(_frag('Configuration interface.', 'text'))],
    declaration=[
      _frag('interface Foo'),
      _frag('<T>'),
      _frag(' extends '),
      _frag('Bar', 'link', target_id=bar_id),
    ],
    groups=[
      {
        'kind': 'propertys',
        'title': 'Properties',
        'showDefaults': True,
        'rows': [
          {
            'id': f'{foo_id}.id',
            'name': 'id',
            'badges': ['readonly'],
            'type': [_frag('string')],
            'default': None,
            'documentation': [_para(_frag('Unique identifier.', 'text'))],
            'signatures': [],
            'sourceUrl': 'https://example.com/foo.ts#L10',
          },
          {
            'id': f'{foo_id}.label',
            'name': 'label',
            'badges': ['optional'],
            'type': [_frag('T')],
            'default': "'none'",
            'documentation': [_para(_frag('Optional display label.', 'text'))],
            'signatures': [],
            'sourceUrl': None,
          },
        ],
      },
      {
        'kind': 'methods',
        'title': 'Methods',
        'showDefaults': False,
        'rows': [
          {
            'id': f'{foo_id}.reset',
            'name': 'reset',
            'badges': [],
            'type': [],
            'default': None,
            'documentation': [_para(_frag('Resets state.', 'text'))],
            'signatures': [
              {
                'id': f'{foo_id}.reset/signature/0',
                'label': [_frag('reset(force?: boolean): void')],
                'documentation': [],
                'parameters': [
                  {
                    'id': f'{foo_id}.reset/signature/0/parameter/0/force',
                    'name': 'force',
                    'badges': ['optional'],
                    'type': [_frag('boolean')],
                    'default': 'false',
                    'documentation': [_para(_frag('Force reset.', 'text'))],
                    'signatures': [],
                    'sourceUrl': None,
                  },
                ],
                'returns': [_frag('void')],
              },
            ],
            'sourceUrl': None,
          },
        ],
      },
    ],
    relatedTypeIds=[bar_id],
  )

  enum_view = _empty_view(
    documentation=[_para(_frag('Lifecycle status.', 'text'))],
    declaration=[_frag('enum Status')],
    groups=[
      {
        'kind': 'members',
        'title': 'Members',
        'showDefaults': True,
        'rows': [
          {
            'id': f'{enum_id}.Active',
            'name': 'Active',
            'badges': [],
            'type': [_frag('string')],
            'default': "'active'",
            'documentation': [_para(_frag('Item is active.', 'text'))],
            'signatures': [],
            'sourceUrl': None,
          },
          {
            'id': f'{enum_id}.Archived',
            'name': 'Archived',
            'badges': ['deprecated'],
            'type': [_frag('string')],
            'default': "'archived'",
            'documentation': [_para(_frag('Item is archived.', 'text'))],
            'signatures': [],
            'sourceUrl': None,
          },
        ],
      },
    ],
  )

  alias_view = _empty_view(
    documentation=[_para(_frag('Supported size tokens.', 'text'))],
    declaration=[
      _frag('type Size'),
      _frag(' = '),
      _frag("'sm' | 'md' | 'lg'"),
    ],
  )

  comp_view = _empty_view(
    documentation=[_para(_frag('Demo component description.', 'text'))],
    declaration=[_frag('component DemoComponent')],
    groups=[
      {
        'kind': 'inputs',
        'title': 'Input Properties',
        'showDefaults': True,
        'rows': [
          {
            'id': f'{comp_id}.size',
            'name': 'size',
            'badges': ['required'],
            'type': [_frag('Size', 'link', target_id=alias_id)],
            'default': None,
            'documentation': [_para(_frag('Controls component size.', 'text'))],
            'signatures': [],
            'sourceUrl': 'https://example.com/demo.ts#L12',
          },
          {
            'id': f'{comp_id}.label',
            'name': 'label',
            'badges': [],
            'type': [_frag('string')],
            'default': "'Demo'",
            'documentation': [_para(_frag('Optional label.', 'text'))],
            'signatures': [],
            'sourceUrl': None,
          },
          {
            'id': f'{comp_id}.hint',
            'name': 'hint',
            'badges': ['optional', 'inherited'],
            'type': [_frag('string')],
            'default': None,
            'documentation': [
              _para(_frag('Inherited from ', 'text'), _frag('Bar', 'link', target_id=bar_id)),
            ],
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
            'id': f'{comp_id}.selected',
            'name': 'selected',
            'badges': [],
            'type': [_frag('Size', 'link', target_id=alias_id)],
            'default': None,
            'documentation': [_para(_frag('Emits when selected.', 'text'))],
            'signatures': [],
            'sourceUrl': None,
          },
        ],
      },
      {
        'kind': 'members',
        'title': 'Attributes and Methods',
        'showDefaults': False,
        'rows': [
          {
            'id': f'{comp_id}.active',
            'name': 'active',
            'badges': ['readonly'],
            'type': [_frag('boolean')],
            'default': None,
            'documentation': [],
            'signatures': [],
            'sourceUrl': None,
          },
          {
            'id': f'{comp_id}.refresh',
            'name': 'refresh',
            'badges': [],
            'type': [],
            'default': None,
            'documentation': [],
            'signatures': [
              {
                'id': f'{comp_id}.refresh/signature/0',
                'label': [_frag('refresh(): void')],
                'documentation': [],
                'parameters': [],
                'returns': [_frag('void')],
              },
            ],
            'sourceUrl': None,
          },
        ],
      },
    ],
    relatedTypeIds=[alias_id],
  )

  service_view = _empty_view(
    documentation=[_para(_frag('Injectable service.', 'text'))],
    declaration=[_frag('injectable DemoService')],
  )

  const_view = _empty_view(
    documentation=[_para(_frag('Default size constant.', 'text'))],
    declaration=[_frag('Size', 'link', target_id=alias_id), _frag(" = 'md'")],
    relatedTypeIds=[alias_id],
  )

  fn_view = _empty_view(
    documentation=[_para(_frag('Formats a size token.', 'text'))],
    declaration=[_frag('function formatSize')],
    signatures=[
      {
        'id': f'{fn_id}/signature/0',
        'label': [_frag('formatSize(size: '), _frag('Size', 'link', target_id=alias_id), _frag('): string')],
        'documentation': [],
        'parameters': [
          {
            'id': f'{fn_id}/signature/0/parameter/0/size',
            'name': 'size',
            'badges': [],
            'type': [_frag('Size', 'link', target_id=alias_id)],
            'default': None,
            'documentation': [],
            'signatures': [],
            'sourceUrl': None,
          },
        ],
        'returns': [_frag('string')],
      },
    ],
    relatedTypeIds=[alias_id],
  )

  bar_view = _empty_view(declaration=[_frag('interface Bar')])

  return {
    'schemaVersion': SCHEMA_VERSION,
    'symbols': [
      {
        'id': bar_id,
        'name': 'Bar',
        'packageName': 'pkg',
        'importPath': 'pkg',
        'importStatement': "import { Bar } from 'pkg';",
        'kind': 'interface',
        'referencePath': 'api/pkg/types/Bar.md',
        'sourceUrl': None,
        'metadata': [],
        'api': bar_view,
        'type': bar_view,
      },
      {
        'id': foo_id,
        'name': 'Foo',
        'packageName': 'pkg',
        'importPath': 'pkg',
        'importStatement': "import { Foo } from 'pkg';",
        'kind': 'interface',
        'referencePath': 'api/pkg/types/Foo.md',
        'sourceUrl': 'https://example.com/foo.ts',
        'metadata': [],
        'api': foo_view,
        'type': foo_view,
      },
      {
        'id': enum_id,
        'name': 'Status',
        'packageName': 'pkg',
        'importPath': 'pkg',
        'importStatement': "import { Status } from 'pkg';",
        'kind': 'enum',
        'referencePath': 'api/pkg/types/Status.md',
        'sourceUrl': None,
        'metadata': [],
        'api': enum_view,
        'type': enum_view,
      },
      {
        'id': alias_id,
        'name': 'Size',
        'packageName': 'pkg',
        'importPath': 'pkg',
        'importStatement': "import { Size } from 'pkg';",
        'kind': 'type_alias',
        'referencePath': 'api/pkg/types/Size.md',
        'sourceUrl': None,
        'metadata': [],
        'api': alias_view,
        'type': alias_view,
      },
      {
        'id': comp_id,
        'name': 'DemoComponent',
        'packageName': 'pkg',
        'importPath': 'pkg',
        'importStatement': "import { DemoComponent } from 'pkg';",
        'kind': 'component',
        'referencePath': 'api/pkg/components/DemoComponent.md',
        'sourceUrl': 'https://example.com/demo.ts',
        'metadata': [{'label': 'Selector', 'value': 'demo-component'}],
        'api': comp_view,
        'type': comp_view,
      },
      {
        'id': service_id,
        'name': 'DemoService',
        'packageName': 'pkg',
        'importPath': 'pkg',
        'importStatement': "import { DemoService } from 'pkg';",
        'kind': 'injectable',
        'referencePath': 'api/pkg/injectables/DemoService.md',
        'sourceUrl': None,
        'metadata': [],
        'api': service_view,
        'type': service_view,
      },
      {
        'id': const_id,
        'name': 'DEFAULT_SIZE',
        'packageName': 'pkg',
        'importPath': 'pkg',
        'importStatement': "import { DEFAULT_SIZE } from 'pkg';",
        'kind': 'constant',
        'referencePath': 'api/pkg/types/DEFAULT_SIZE.md',
        'sourceUrl': None,
        'metadata': [],
        'api': const_view,
        'type': const_view,
      },
      {
        'id': fn_id,
        'name': 'formatSize',
        'packageName': 'pkg',
        'importPath': 'pkg',
        'importStatement': "import { formatSize } from 'pkg';",
        'kind': 'function',
        'referencePath': 'api/pkg/types/formatSize.md',
        'sourceUrl': None,
        'metadata': [],
        'api': fn_view,
        'type': fn_view,
      },
    ],
    'index': {
      'Bar': [bar_id],
      'Foo': [foo_id],
      'Status': [enum_id],
      'Size': [alias_id],
      'DemoComponent': [comp_id],
      'DemoService': [service_id],
      'DEFAULT_SIZE': [const_id],
      'formatSize': [fn_id],
    },
    'members': {},
    'memberIndex': {},
    'targets': {
      bar_id: {'symbolId': bar_id, 'anchor': 'Bar'},
      foo_id: {'symbolId': foo_id, 'anchor': 'Foo'},
      f'{foo_id}.id': {'symbolId': foo_id, 'anchor': 'Foo.id'},
      f'{foo_id}.label': {'symbolId': foo_id, 'anchor': 'Foo.label'},
      f'{foo_id}.reset': {'symbolId': foo_id, 'anchor': 'Foo.reset'},
      f'{foo_id}.reset/signature/0': {'symbolId': foo_id, 'anchor': 'Foo.reset-0'},
      f'{foo_id}.reset/signature/0/parameter/0/force': {'symbolId': foo_id, 'anchor': 'Foo.reset-0-force'},
      enum_id: {'symbolId': enum_id, 'anchor': 'Status'},
      f'{enum_id}.Active': {'symbolId': enum_id, 'anchor': 'Status.Active'},
      f'{enum_id}.Archived': {'symbolId': enum_id, 'anchor': 'Status.Archived'},
      alias_id: {'symbolId': alias_id, 'anchor': 'Size'},
      comp_id: {'symbolId': comp_id, 'anchor': 'DemoComponent'},
      f'{comp_id}.size': {'symbolId': comp_id, 'anchor': 'DemoComponent.size'},
      f'{comp_id}.label': {'symbolId': comp_id, 'anchor': 'DemoComponent.label'},
      f'{comp_id}.hint': {'symbolId': comp_id, 'anchor': 'DemoComponent.hint'},
      f'{comp_id}.selected': {'symbolId': comp_id, 'anchor': 'DemoComponent.selected'},
      f'{comp_id}.active': {'symbolId': comp_id, 'anchor': 'DemoComponent.active'},
      f'{comp_id}.refresh': {'symbolId': comp_id, 'anchor': 'DemoComponent.refresh'},
      f'{comp_id}.refresh/signature/0': {'symbolId': comp_id, 'anchor': 'DemoComponent.refresh-0'},
      service_id: {'symbolId': service_id, 'anchor': 'DemoService'},
      const_id: {'symbolId': const_id, 'anchor': 'DEFAULT_SIZE'},
      fn_id: {'symbolId': fn_id, 'anchor': 'formatSize'},
      f'{fn_id}/signature/0': {'symbolId': fn_id, 'anchor': 'formatSize-0'},
      f'{fn_id}/signature/0/parameter/0/size': {'symbolId': fn_id, 'anchor': 'formatSize-0-size'},
    },
  }


def _strip_tags(html):
  return re.sub(r'<[^>]+>', '', html)


def test_interface_renders_code_declaration_and_property_list():
  renderer = ApiRenderer(_build_artifact())
  html = renderer.for_page('api/pkg/types/Foo.md').render_symbol('Foo', mode='type')

  assert '<table' not in html
  match = re.search(r'<pre\b[^>]*class="api-declaration"[^>]*><code>(.*?)</code></pre>', html, re.S)
  assert match is not None
  code_html = match.group(1)
  code_text = _strip_tags(code_html)

  assert code_text == (
    'interface Foo&lt;T&gt; extends Bar {\n'
    '  // Properties\n'
    '  readonly id: string;\n'
    '  label?: T;\n'
    '\n'
    '  // Methods\n'
    '  reset(force?: boolean): void;\n'
    '}'
  )
  assert '<span class="api-declaration-comment">// Properties</span' in code_html
  assert '<span class="api-declaration-comment">// Methods</span' in code_html
  assert 'href="Bar.md#t:Bar"' in code_html
  assert 'href="#t%3AFoo.id"' in code_html
  assert 'href="#t%3AFoo.label"' in code_html
  assert 'href="#t%3AFoo.reset"' in code_html
  assert 'class="api-member-list api-member-list--compact"' in html
  assert 'data-badge="readonly"' in html
  assert 'data-badge="default"' in html
  assert 'Unique identifier.' in html
  assert 'Force reset.' in html


def test_enum_renders_code_declaration_and_member_list():
  renderer = ApiRenderer(_build_artifact())
  html = renderer.for_page('api/pkg/types/Status.md').render_symbol('Status', mode='type')

  assert '<table' not in html
  match = re.search(r'<pre\b[^>]*class="api-declaration"[^>]*><code>(.*?)</code></pre>', html, re.S)
  assert match is not None
  code_html = match.group(1)
  code_text = _strip_tags(code_html)

  assert code_text == (
    'enum Status {\n'
    "  Active = &#39;active&#39;,\n"
    "  Archived = &#39;archived&#39;,\n"
    '}'
  )
  assert 'href="#t%3AStatus.Active"' in code_html
  assert 'href="#t%3AStatus.Archived"' in code_html
  assert 'Item is active.' in html
  assert 'data-badge="deprecated"' in html


def test_simple_type_alias_renders_prominent_code_block_and_description():
  renderer = ApiRenderer(_build_artifact())
  html = renderer.for_page('api/pkg/types/Size.md').render_symbol('Size', mode='type')

  match = re.search(r'<pre\b[^>]*class="api-declaration"[^>]*><code>(.*?)</code></pre>', html, re.S)
  assert match is not None
  assert _strip_tags(match.group(1)) == "type Size = &#39;sm&#39; | &#39;md&#39; | &#39;lg&#39;;"
  assert 'Supported size tokens.' in html
  assert 'api-member-list' not in html


def test_component_renders_unified_class_declaration_with_angular_input_output_syntax():
  renderer = ApiRenderer(_build_artifact())
  html = renderer.for_page('api/pkg/components/DemoComponent.md').render_symbol('DemoComponent', mode='api')

  assert '<table' not in html
  assert 'data-api-symbol="pkg#DemoComponent"' in html
  assert '#### Input Properties {#DemoComponent_i}' in html
  assert 'demo-component' in html
  assert "import { DemoComponent } from &#39;pkg&#39;;" in html
  assert 'class="api-kind"' in html
  assert 'class="api-member-list"' in html
  assert 'data-badge="required"' in html
  assert 'href="../types/Size.md#t:Size"' in html
  assert 'Controls component size.' in html
  assert html.index('Demo component description.') < html.index('class="api-declaration"')

  match = re.search(r'<pre\b[^>]*class="api-declaration"[^>]*><code>(.*?)</code></pre>', html, re.S)
  assert match is not None
  code_html = match.group(1)
  assert _strip_tags(code_html) == (
    'class DemoComponent {\n'
    '  // Inputs\n'
    '  size = input.required&lt;Size&gt;();\n'
    "  label = input&lt;string&gt;(&#39;Demo&#39;);\n"
    '  hint = input&lt;string&gt;();\n'
    '\n'
    '  // Outputs\n'
    '  selected = output&lt;Size&gt;();\n'
    '\n'
    '  // Properties\n'
    '  readonly active: boolean;\n'
    '\n'
    '  // Methods\n'
    '  refresh(): void;\n'
    '}'
  )
  assert '<span class="api-declaration-comment">// Inputs</span' in code_html
  assert '<span class="api-declaration-comment">// Outputs</span' in code_html
  assert '<span class="api-declaration-comment">// Properties</span' in code_html
  assert '<span class="api-declaration-comment">// Methods</span' in code_html
  assert 'href="#DemoComponent.size"' in code_html
  assert 'href="#DemoComponent.selected"' in code_html
  assert 'href="../types/Size.md#t:Size"' in code_html

  hint_match = re.search(r'<li\b[^>]*id="DemoComponent\.hint"[^>]*>(.*?)</li>', html, re.S)
  assert hint_match is not None
  hint_item = hint_match.group(1)
  header_match = re.search(r'<div class="api-member-header">(.*?)</div>', hint_item, re.S)
  assert header_match is not None
  assert 'api-member-origin' in header_match.group(1)
  assert 'Inherited from ' in header_match.group(1)
  assert 'Bar</a>' in header_match.group(1)
  assert 'data-badge="inherited"' not in header_match.group(1)
  assert 'api-member-body' not in hint_item


def test_service_constant_and_function_render_unified_declaration_blocks():
  renderer = ApiRenderer(_build_artifact())

  service_html = renderer.for_page('api/pkg/injectables/DemoService.md').render_symbol('DemoService', mode='api')
  service_decl = re.search(r'<pre\b[^>]*class="api-declaration"[^>]*><code>(.*?)</code></pre>', service_html, re.S)
  assert service_decl is not None
  assert _strip_tags(service_decl.group(1)) == 'class DemoService {}'

  const_html = renderer.for_page('api/pkg/types/DEFAULT_SIZE.md').render_symbol('DEFAULT_SIZE', mode='type')
  const_decl = re.search(r'<pre\b[^>]*class="api-declaration"[^>]*><code>(.*?)</code></pre>', const_html, re.S)
  assert const_decl is not None
  assert _strip_tags(const_decl.group(1)) == "const DEFAULT_SIZE: Size = &#39;md&#39;;"
  assert 'href="Size.md#t:Size"' in const_decl.group(1)

  fn_html = renderer.for_page('api/pkg/types/formatSize.md').render_symbol('formatSize', mode='type')
  fn_decl = re.search(r'<pre\b[^>]*class="api-declaration"[^>]*><code>(.*?)</code></pre>', fn_html, re.S)
  assert fn_decl is not None
  assert _strip_tags(fn_decl.group(1)) == 'function formatSize(size: Size): string;'
  assert 'href="Size.md#t:Size"' in fn_decl.group(1)
