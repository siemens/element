from markdown import Markdown

from md_extension_element_docs.extension import ElementDocsExtension

SITE = 'https://element.siemens.io/'
NEW_TAB = ' target="_blank" rel="noopener noreferrer"'


def convert(source):
  return Markdown(extensions=[ElementDocsExtension(site_url=SITE)]).convert(source)


def test_external_links_open_in_new_tab():
  html = convert('[MDN](https://developer.mozilla.org/) and <a href="http://example.test/x" class="c">raw</a>')
  assert f'<a href="https://developer.mozilla.org/"{NEW_TAB}>MDN</a>' in html
  assert f'<a href="http://example.test/x" class="c"{NEW_TAB}>raw</a>' in html


def test_site_relative_and_explicit_target_links_are_untouched():
  source = '\n\n'.join([
    '[site](https://element.siemens.io/components/)',
    '[relative](../page.md#a)',
    '[anchor](#a)',
    '[mail](mailto:a@b.test)',
    '<a href="https://example.test/" target="_self">kept</a>',
    '`<a href="https://example.test/">code</a>`',
  ])
  assert 'target="_blank"' not in convert(source)
