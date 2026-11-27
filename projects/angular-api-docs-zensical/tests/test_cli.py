"""Exercise the published commands with a small Angular library and docs site."""

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
  assert 'api-member--callable' in section
  assert '(options:' in section
  assert '=&gt;' in section or '=>' in section
  assert 'Parameters' in section
  assert 'api-member-name' not in section.split('Parameters', 1)[0]
  assert 'constructor(' not in section
  assert 'Returns:' not in section


def test_component_api_uses_unified_property_list_and_angular_declaration_block(site):
  reference = (site / f'site/{WIDGET_PAGE}/index.html').read_text(encoding='utf-8')
  match = re.search(r'<section\b[^>]*data-api-mode="?api"?.*?(?=<h3\b[^>]*id="?types-documentation"?)', reference, re.S)
  assert match is not None
  component_section = match.group(0)

  assert '<table' not in reference
  assert 'api-member-list' in component_section
  assert 'api-member-header' in component_section
  assert 'api-member-name' in component_section
  assert 'api-member-type' in component_section
  assert 'data-badge="required"' in component_section or 'data-badge=required' in component_section
  assert 'data-badge="default"' in component_section or 'data-badge=default' in component_section
  assert 'api-metadata' in component_section
  assert 'api-import' in component_section
  assert 'Returns:' in component_section

  decl_match = re.search(r'<pre\b[^>]*class="?api-declaration"?[^>]*><code>(.*?)</code></pre>', component_section, re.S)
  assert decl_match is not None
  decl_html = decl_match.group(1)
  decl_text = re.sub(r'<[^>]+>', '', decl_html)
  assert 'class WidgetComponent {' in decl_text
  assert 'heading = input.required&lt;string&gt;();' in decl_text
  assert 'fallbackTitle = input&lt;string&gt;(DEFAULT_WIDGET_TITLE);' in decl_text
  assert "color = input&lt;string&gt;('primary');" in decl_text or 'color = input&lt;string&gt;(&#39;primary&#39;);' in decl_text
  assert 'changed = output&lt;WidgetChangeEvent&gt;();' in decl_text
  assert 'refresh(): void;' in decl_text
  assert 'href="#t:DEFAULT_WIDGET_TITLE"' in decl_html or 'href=#t:DEFAULT_WIDGET_TITLE' in decl_html
  assert 'href="#t:WidgetChangeEvent"' in decl_html or 'href=#t:WidgetChangeEvent' in decl_html


def test_interface_and_type_alias_pages_render_typescript_declaration_headers(site):
  extended = (site / 'site/api/fixture/library/types/ExtendedWidgetMap/index.html').read_text(encoding='utf-8')
  alias = (site / 'site/api/fixture/library/types/WidgetLabel/index.html').read_text(encoding='utf-8')

  assert '<table' not in extended
  decl_match = re.search(r'<pre\b[^>]*class="?api-declaration"?[^>]*><code>(.*?)</code></pre>', extended, re.S)
  assert decl_match is not None
  decl_html = decl_match.group(1)
  assert 'interface' in decl_html
  assert 'ExtendedWidgetMap' in decl_html
  assert 'extends' in decl_html
  assert 'WidgetMap' in decl_html
  assert 'href="#t%3AExtendedWidgetMap.title"' in decl_html or 'href=#t%3AExtendedWidgetMap.title' in decl_html
  assert 'WidgetLabel' in decl_html
  assert 'api-member-list' in extended

  alias_match = re.search(r'<pre\b[^>]*class="?api-declaration"?[^>]*><code>(.*?)</code></pre>', alias, re.S)
  assert alias_match is not None
  alias_html = alias_match.group(1)
  assert 'type' in alias_html
  assert 'WidgetLabel' in alias_html
  assert 'string</a> &amp; WidgetBrand;' in alias_html
  assert 'Branded string label' in alias


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
