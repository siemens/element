"""Exercise the published commands with a small Angular library and docs site."""

from html.parser import HTMLParser
import json
from pathlib import Path
import re
import shutil
import subprocess

import pytest


EXTRACTOR = Path(__file__).resolve().parents[2] / 'angular-api-docs-extractor'
SITE_FIXTURE = Path(__file__).with_name('site')
WIDGET_PAGE = 'api/fixture/library/components/WidgetComponent'
GENERATE_PAGES = ('angular-api-docs-zensical', 'generate-pages', '--config', 'mkdocs.yml')


def run(site, *command):
  result = subprocess.run(command, cwd=site, capture_output=True, text=True, timeout=60)
  assert result.returncode == 0, result.stdout + result.stderr


@pytest.fixture(scope='module')
def site(tmp_path_factory):
  site = tmp_path_factory.mktemp('widget-docs')
  shutil.copytree(SITE_FIXTURE, site, dirs_exist_ok=True)
  config = {
    'root': str(EXTRACTOR / 'fixtures'),
    'packages': ['library'],
    'output': {'dir': str(site / 'prepared')},
  }
  (site / 'api-docs.config.mjs').write_text(f'export default {json.dumps(config)};\n', encoding='utf-8')

  run(site, 'node', str(EXTRACTOR / 'bin/angular-api-docs.ts'), 'extract')
  run(site, *GENERATE_PAGES)
  run(site, 'zensical', 'build', '--clean', '--strict')
  return site


def test_publishes_the_widget_reference_page_in_site_navigation(site):
  assert (site / f'docs/{WIDGET_PAGE}.md').is_file()
  guide = (site / 'site/guide/index.html').read_text(encoding='utf-8')
  reference = (site / f'site/{WIDGET_PAGE}/index.html').read_text(encoding='utf-8')

  assert f'href="../{WIDGET_PAGE}/"' in guide
  assert 'Displays a widget with a heading.' in reference
  assert 'Heading displayed above the widget.' in reference


def test_exports_the_widget_api_in_markdown_and_lists_it_in_llms_txt(site):
  markdown = (site / 'site/guide/index.md').read_text(encoding='utf-8')
  index = (site / 'site/llms.txt').read_text(encoding='utf-8')

  assert 'Heading displayed above the widget.' in markdown
  assert 'guide/index.md' in index
  assert f'{WIDGET_PAGE}/index.md' in index


def test_renders_linked_types_defaults_and_code_examples(site):
  reference = (site / f'site/{WIDGET_PAGE}/index.html').read_text(encoding='utf-8')
  markdown = (site / f'site/{WIDGET_PAGE}/index.md').read_text(encoding='utf-8')
  guide = (site / 'site/guide/index.html').read_text(encoding='utf-8')

  assert re.search(r'<a\b[^>]*href="?https://example\.com/widget#heading(?:"|\s|>)', reference)
  assert re.search(r'<a\b[^>]*href="?#t:DEFAULT_WIDGET_TITLE"?[^>]*>DEFAULT_WIDGET_TITLE</a>', reference)
  for symbol in ['DEFAULT_WIDGET_TITLE', 'WidgetChangeEvent', 'ExtendedWidgetMap']:
    assert re.search(rf'<h3\b[^>]*id="?t:{symbol}(?:"|\s|>)', guide)
  assert 'Example:' in reference
  assert 'widget-theme.heading' in markdown
  assert "@use 'widget-theme';" in markdown
  assert '<fixture-widget heading="Hello" />' in markdown


def test_preserves_bold_text_and_inline_code_in_api_comments(site):
  reference = (site / f'site/{WIDGET_PAGE}/index.html').read_text(encoding='utf-8')
  markdown = (site / f'site/{WIDGET_PAGE}/index.md').read_text(encoding='utf-8')

  assert '<strong>Important:</strong> Provide a <strong>short <code>heading</code></strong>.' in reference
  assert '**Important:** Provide a **short `heading`**.' in markdown


@pytest.mark.parametrize(('symbol', 'label', 'url'), [
  ('WidgetLabel', 'type alias', 'https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-aliases'),
  ('WidgetMap', 'interface', 'https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#interfaces'),
  ('DEFAULT_WIDGET_TITLE', 'constant', 'https://www.typescriptlang.org/docs/handbook/variable-declarations.html#const-declarations'),
])
def test_type_card_kinds_link_to_language_documentation(site, symbol, label, url):
  reference = (site / f'site/api/fixture/library/types/{symbol}/index.html').read_text(encoding='utf-8')

  assert re.search(
    rf'<a\b[^>]*class="?api-kind"?[^>]*href="?{re.escape(url)}"?[^>]*>{label}</a\s*>',
    reference,
  )


def test_type_card_constructors_omit_redundant_name_and_returns(site):
  guide = (site / 'site/guide/index.html').read_text(encoding='utf-8')
  match = re.search(
    r'id="?t:WidgetChangeEvent_constructors"?.*?(?=<div\b[^>]*id="?t:WidgetChangeEvent_a"?)',
    guide,
    re.S,
  )
  assert match is not None
  section = match.group(0)

  assert 't:WidgetChangeEvent.constructor' in section
  assert 'api-method-list' in section
  assert 'api-method-item' in section
  assert '(options:' in section
  assert '=&gt;' in section or '=>' in section
  assert 'Parameters' in section
  assert 'api-member-name' not in section.split('Parameters', 1)[0]
  assert 'constructor(' not in section
  assert 'Returns:' not in section


def test_renders_compact_two_column_table_for_flat_members(site):
  reference = (site / f'site/{WIDGET_PAGE}/index.html').read_text(encoding='utf-8')
  inputs_match = re.search(
    r'id="?WidgetComponent_i"?.*?(?=<h4\b[^>]*id="?WidgetComponent_o"?)',
    reference,
    re.S,
  )
  assert inputs_match is not None
  inputs = inputs_match.group(0)

  assert 'api-compact-table' in inputs
  assert re.findall(r'<th\b[^>]*scope="?col"?[^>]*>(.*?)</th>', inputs) == ['Name', 'Details']
  assert 'data-badge="required"' in inputs or 'data-badge=required' in inputs
  assert 'api-member-meta' in inputs
  assert 'Default:' in inputs
  assert 'Heading displayed above the widget.' in inputs


def test_renders_methods_as_flat_definition_list(site):
  reference = (site / f'site/{WIDGET_PAGE}/index.html').read_text(encoding='utf-8')
  members_match = re.search(
    r'id="?WidgetComponent_a"?.*?(?=<div\b[^>]*class="?api-tab-panel api-tab-panel-ts"?)',
    reference,
    re.S,
  )
  assert members_match is not None
  members = members_match.group(0)

  assert 'api-method-list' in members
  assert 'api-signature' in members
  assert re.search(r'refresh\(\): <a\b[^>]*>void</a>', members)
  assert 'Refreshes the widget display.' in members
  assert 'Returns:' in members


def test_renders_tabbed_typescript_view_for_interfaces_and_components(site):
  guide = (site / 'site/guide/index.html').read_text(encoding='utf-8')
  reference = (site / f'site/{WIDGET_PAGE}/index.html').read_text(encoding='utf-8')

  assert 'name="api-tabs-t:ExtendedWidgetMap"' in guide
  assert 'for="api-tabs-t:ExtendedWidgetMap-members">Members</label>' in guide
  assert 'for="api-tabs-t:ExtendedWidgetMap-ts">TypeScript</label>' in guide
  assert 'interface ExtendedWidgetMap extends ' in guide

  assert 'name="api-tabs-WidgetComponent"' in reference
  assert 'for="api-tabs-WidgetComponent-members">Members</label>' in reference
  assert 'for="api-tabs-WidgetComponent-ts">TypeScript</label>' in reference
  assert 'api-symbol-card' in reference
  for html in (guide, reference):
    assert re.search(
      r'<a\b[^>]*class="?api-kind"?[^>]*href="?https://angular\.dev/api/core/Component"?[^>]*>component</a\s*>',
      html,
    )
  assert 'class WidgetComponent {' in reference
  assert re.search(r'heading = input\.required&lt;<a\b[^>]*>string</a>&gt;\(\);', reference)
  assert re.search(r"color = input&lt;<a\b[^>]*>string</a>&gt;\(&#39;primary&#39;\);", reference)
  assert re.search(
    r'fallbackTitle = input&lt;<a\b[^>]*>string</a>&gt;\(<a\b[^>]*>DEFAULT_WIDGET_TITLE</a>\);',
    reference,
  )
  assert re.search(r'changed = output&lt;<a\b[^>]*>WidgetChangeEvent</a>&gt;\(\);', reference)
  assert re.search(r'openChange = output&lt;<a\b[^>]*>boolean</a>&gt;\(\);', reference)


def test_renders_simple_type_aliases_without_tabs(site):
  alias_page = (site / 'site/api/fixture/library/types/WidgetLabel/index.html').read_text(encoding='utf-8')

  assert 'api-ts-code' in alias_page
  assert re.search(r'type WidgetLabel = <a\b[^>]*>string</a> &amp; WidgetBrand;', alias_page)
  assert 'data-api-tabs' not in alias_page


def test_api_mode_tabs_keep_radio_inputs_directly_inside_tab_bar_without_paragraph_wrapping(site):
  reference = (site / f'site/{WIDGET_PAGE}/index.html').read_text(encoding='utf-8')

  class _TabStructureParser(HTMLParser):
    _void = frozenset(('area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
                       'link', 'meta', 'param', 'source', 'track', 'wbr'))

    def __init__(self):
      super().__init__()
      self.stack = []
      self.api_mode = None
      self.tabs = []

    def handle_starttag(self, tag, attrs):
      attr_map = dict(attrs)
      classes = set(attr_map.get('class', '').split())
      if tag == 'section' and 'si-docs-api' in classes:
        self.api_mode = attr_map.get('data-api-mode')
      if 'api-tabs' in classes:
        self.tabs.append({'mode': self.api_mode, 'children': [], 'bar': [], 'panels': []})
      if self.stack and self.tabs:
        parent_classes = self.stack[-1][1]
        if 'api-tabs' in parent_classes:
          self.tabs[-1]['children'].append((tag, classes))
        if 'api-tab-bar' in parent_classes:
          self.tabs[-1]['bar'].append((tag, classes))
        if 'api-tab-panels' in parent_classes:
          self.tabs[-1]['panels'].append((tag, classes))
      if tag not in self._void:
        self.stack.append((tag, classes))

    def handle_endtag(self, tag):
      for index in range(len(self.stack) - 1, -1, -1):
        if self.stack[index][0] == tag:
          del self.stack[index:]
          break

  parser = _TabStructureParser()
  parser.feed(reference)
  parser.close()

  api_tabs = [tab for tab in parser.tabs if tab['mode'] == 'api']
  assert len(api_tabs) == 1
  for tab in parser.tabs:
    assert [tag for tag, _ in tab['children']] == ['div', 'div']
    assert 'api-tab-bar' in tab['children'][0][1]
    assert 'api-tab-panels' in tab['children'][1][1]

    assert [tag for tag, _ in tab['bar']] == ['input', 'label', 'input', 'label']
    assert {'api-tab-input', 'api-tab-input-members'} <= tab['bar'][0][1]
    assert 'api-tab-label' in tab['bar'][1][1]
    assert {'api-tab-input', 'api-tab-input-ts'} <= tab['bar'][2][1]
    assert 'api-tab-label' in tab['bar'][3][1]

    assert [tag for tag, _ in tab['panels']] == ['div', 'div']
    assert {'api-tab-panel', 'api-tab-panel-members'} <= tab['panels'][0][1]
    assert {'api-tab-panel', 'api-tab-panel-ts'} <= tab['panels'][1][1]

  assert re.search(r'<h4\b[^>]*id="?WidgetComponent_i"?', reference)


def test_regeneration_removes_stale_reference_pages_but_keeps_authored_docs(site, tmp_path):
  shutil.copytree(site, tmp_path, ignore=shutil.ignore_patterns('site'), dirs_exist_ok=True)
  stale = tmp_path / 'docs/api/old-widget.md'
  stale.write_text('# Old generated page\n', encoding='utf-8')

  run(tmp_path, *GENERATE_PAGES)

  assert not stale.exists()
  assert (tmp_path / f'docs/{WIDGET_PAGE}.md').is_file()
  assert (tmp_path / 'docs/guide.md').read_text(encoding='utf-8') == (
    SITE_FIXTURE / 'docs/guide.md'
  ).read_text(encoding='utf-8')
