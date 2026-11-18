"""Authoring, artifact and export errors name the invalid input."""

from markdown import Markdown
import pytest
from zensical.extensions.context import ContextExtension, Page

from docs_fixtures import fixture, symbol
from md_extension_element_api.adapter import ApiRenderError, safe_url
from md_extension_element_api.extension import ElementApiExtension
from md_extension_element_api.renderer import ApiRenderer, reference_path
from md_extension_element_api.structured import preprocess_api

PLACEHOLDERS = [
  pytest.param('<si-docs-api name="Widget"></si-docs-type>', 'index.md: Mismatched closing API tag', id='mismatched_closing_tag'),
  pytest.param('<si-docs-api name="Widget">', 'Unclosed <si-docs-api>', id='unclosed_tag'),
  pytest.param('<si-docs-type name=A><si-docs-api name=B/></si-docs-type>', 'only API tag that can contain', id='illegal_nesting'),
  pytest.param('<si-docs-api name=A name=B/>', "attribute 'name'", id='duplicate_attribute'),
  pytest.param('<si-docs-api name/>', "attribute 'name'", id='valueless_attribute'),
  pytest.param('<si-docs-types name="A"></si-docs-types>', 'does not accept attributes', id='types_attributes'),
  pytest.param('<si-docs-api/>', 'exactly one', id='no_selector'),
  pytest.param('<si-docs-api name=A component=B/>', 'exactly one', id='two_selectors'),
  pytest.param('<si-docs-api name=A noHeading="yes"/>', 'noHeading', id='bad_no_heading'),
  pytest.param('<si-docs-api name=A>text</si-docs-api>', 'must be empty', id='non_empty_api'),
  pytest.param('<si-docs-types>text</si-docs-types>', 'only nested <si-docs-type>', id='non_empty_types'),
]


@pytest.mark.parametrize('source, message', PLACEHOLDERS)
def test_placeholder_errors(tmp_path, source, message):
  page = ContextExtension(page=Page(url='index.html', path='index.md'), config={})
  markdown = Markdown(extensions=[page, ElementApiExtension(tmp_path / 'api.json', enabled=True)])
  with pytest.raises(ApiRenderError, match=message):
    markdown.convert(source)


@pytest.mark.parametrize('name, message, changes', [
  ('Widget', 'Ambiguous API symbol', {}),
  ('Dup.run', 'Ambiguous API member', {}),
  ('Missing', "'Missing' was not found", {}),
  ('Config', 'schemaVersion 2', {'schemaVersion': 1}),
])
def test_adapter_lookup_errors(name, message, changes):
  data = fixture(symbol('other', 'Widget', packageName='@other/lib', importPath='@other/lib'))
  data['memberIndex']['Dup.run'] = ['run-selection'] * 2
  with pytest.raises(ApiRenderError, match=message):
    ApiRenderer({**data, **changes}).prepare_page([{'mode': 'api', 'name': name}], 'index.md', [])


@pytest.mark.parametrize('value', ['https://a.example/x', 'http://a', 'mailto:a@b.c', '../x.md#a', '#a', 'x?y=1'])
def test_safe_url_accepts(value):
  assert safe_url(value) == value


@pytest.mark.parametrize('check, value, message', [
  *[(safe_url, v, 'API documentation URL') for v in
    ['', '//x', 'javascript:alert(1)', 'a b', 'a\\b', 'a\x00', 'http:', 'https:///x', 'http://[bad', 'http://a:99999']],
  *[(reference_path, v, 'referencePath') for v in
    ['/a.md', '../a.md', 'a/./b.md', 'a//b.md', 'a.md?x', 'a.md#x', 'https://a/b.md', 'a.txt']],
])
def test_unsafe_urls_and_reference_paths(check, value, message):
  with pytest.raises(ApiRenderError, match=message):
    check(value)


@pytest.mark.parametrize('change, site, message', [
  (('data-api-symbol="widget"', 'data-api-symbol="nope"'), 'https://a/', 'Unknown rendered API selection'),
  (('data-api-member="run-selection"', 'data-api-member="x"'), 'https://a/', 'Unknown rendered API member'),
  (('id="Widget.publicValue"', 'id="gone"'), 'https://a/', 'no existing browser anchor'),
  (('</section>', ''), 'https://a/', 'Unclosed rendered API section'),
  *[(('a', 'a'), site, 'absolute HTTP') for site in ('/docs', 'https://a/?q')],
  (('a', 'a'), 'ftp://a/', 'Unsafe API documentation URL scheme'),
])
def test_export_errors(change, site, message):
  html = '\n'.join(ApiRenderer(fixture()).prepare_page(
    [{'mode': 'api', 'name': 'Widget'}, {'mode': 'type', 'name': 'Widget.run'}], 'index.md', []))
  with pytest.raises(ApiRenderError, match=message):
    preprocess_api(html.replace(*change), fixture(), 'index.md', site)
