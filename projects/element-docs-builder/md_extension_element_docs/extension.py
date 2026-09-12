import re
import xml.etree.ElementTree as etree
from abc import abstractmethod
from pathlib import PurePosixPath
from typing import Any, cast
from urllib.parse import urlencode, urlparse

from markdown import Extension
from markdown.preprocessors import Preprocessor
from markdown.treeprocessors import Treeprocessor


class ElementTabTreeProcessor(Treeprocessor):
  def run(self, root):
    replace_dash = re.compile(r'\s*---$')
    tab_elements = []
    tab_headers = []
    current_tab_elements = []
    current_element = None

    # Extrac all elements that belong inside a tab
    for index, child in enumerate(root):
      if child.tag == 'h2' and child.text is not None and child.text.endswith('---'):
        child.text = replace_dash.sub('', child.text)
        child.set('class', 'tab-anchor') # This makes the tab invisible
        tab_headers.append(child.text)
        if current_element is not None:
          tab_elements.append(current_tab_elements)
          current_tab_elements = []
        current_element = child
        current_tab_elements.append(child)
      elif current_element is not None:
        current_tab_elements.append(child)

    # Add the last remaining tab to the tab_elements
    if current_element is not None:
      tab_elements.append(current_tab_elements)

    # Remove all elements that belong inside a tab
    for tab in tab_elements:
      for child in tab:
        root.remove(child)

    # Add the tab control (the clickable one)
    tab_control = etree.Element('div', {'role': 'tablist', 'class': 'tabs', 'markdown': '0'})
    for index, tab in enumerate(tab_headers):
      tab_element = etree.Element('button', {'role': 'tab', 'aria-selected': 'true' if index == 0 else 'false', 'aria-controls': f'panel-{index}'})
      tab_element.text = tab
      tab_control.append(tab_element)
    root.append(tab_control)

    # Add the tab panels
    for index, tab in enumerate(tab_elements):
      tab_element = etree.Element('section', {'id': f'panel-{index}', 'role': 'tabpanel'})
      if index > 0:
        tab_element.set('hidden', 'true')
      tab_element.extend(tab)
      root.append(tab_element)

class ElementHtmlPreProcessor(Preprocessor):
  def __init__(self, tag_name, *args, **kwargs):
    """Initialize."""
    self.tag_name = tag_name
    super().__init__(*args, **kwargs)

  def run(self, lines):
    escape_regex = re.compile(r'.*`.*`.*')
    full_line_regex = re.compile(rf'<{self.tag_name}.*</{self.tag_name}>')
    lines_processed = []
    line_processing_buffer = []
    for line in lines:

      if escape_regex.match(line):
        lines_processed.append(line)
        continue

      match_start = f'<{self.tag_name}' in line
      match_end = f'</{self.tag_name}>' in line
      if match_start and match_end:
        lines_processed.append(full_line_regex.sub(line, self.convert_tag(line)))
        line_processing_buffer.clear()
      elif match_start:
        line_processing_buffer.append(line)
      elif match_end:
        line_processing_buffer.append(line)
        lines_processed.append(self.convert_tag(''.join(line_processing_buffer)))
        line_processing_buffer.clear()
      elif len(line_processing_buffer) > 0:
        line_processing_buffer.append(line)
      else:
        lines_processed.append(line)

    return lines_processed

  @abstractmethod
  def convert_tag(self, line) -> str:
    pass

class ElementExamplePreProcessor(ElementHtmlPreProcessor):
  def __init__(self, examples_base: str, page_path: str, docs_dir: str, *args: Any, **kwargs: Any) -> None:
    """Initialize.

    Args:
      examples_base: Base URL for examples. Should include trailing slash
                    for correct URL construction (e.g., '/element-examples/').
      page_path: Current page's source URI from the documentation context.
      docs_dir: Documentation source directory.
    """
    self.configured_examples_base = examples_base
    self.page_path = page_path
    self.docs_dir = docs_dir
    self.set_examples_base()
    super().__init__('si-docs-component', *args, **kwargs)

  def set_examples_base(self) -> None:
    self.examples_base = self.configured_examples_base
    url = urlparse(self.examples_base)
    # If no scheme, we assume we need to build a relative path to the examples
    if url.scheme == '':
      page_path = PurePosixPath(self.page_path)
      docs_path = PurePosixPath(self.docs_dir)
      try:
        page_path = page_path.relative_to(docs_path)
      except ValueError:
        if docs_path.name in page_path.parts:
          page_path = PurePosixPath(*page_path.parts[page_path.parts.index(docs_path.name) + 1:])
      segments = page_path.parts
      # Build a relative path to the root and join with the examples_base
      base = PurePosixPath('/'.join(['..' if segment else '' for segment in segments]))
      self.examples_base = str(base / self.examples_base.lstrip('/'))
      if self.configured_examples_base.endswith('/'):
        self.examples_base += '/'

  def run(self, lines):
    for extension in self.md.registeredExtensions:
      page = getattr(extension, '_kwargs', {}).get('page')
      file = getattr(page, 'file', None)
      page_url = getattr(page, 'url', None)
      if page_url is not None:
        page_path = page_url.strip('/')
        if page_path and not page_url.endswith('/'):
          page_path = str(PurePosixPath(page_path).parent)
        self.docs_dir = ''
        self.page_path = page_path
        self.set_examples_base()
        break

      page_path = getattr(file, 'src_uri', None) or getattr(page, 'path', None)
      if page_path is not None:
        config = getattr(extension, '_kwargs', {}).get('config', {})
        self.docs_dir = config.get('docs_dir', self.docs_dir)
        self.page_path = page_path
        self.set_examples_base()
        break
    return super().run(lines)

  def convert_tag(self, line) -> str:
    examples = []
    element = cast(etree.Element, etree.fromstring(line))
    ## extracting examples
    root_example = element.get('example')
    examples_base = element.get('base')
    if root_example:
      examples.append([root_example])
    for child in element:
      examples.append([child.get('example'), child.get('heading')])

    ## updating element
    prev_height = element.get('height')
    element.clear()
    element.tag = 'iframe'
    element.set('class', 'component-preview')
    # on server: ../../../demo/index.html
    # dev: http://localhost:4200
    encode_object = {'base': examples_base if examples_base else '','e': list(map(lambda x: f'{x[0]};{x[1]}' if len(x) > 1 else x[0], examples))}
    element.set('data-preview-url', f"{self.examples_base.rstrip('/')}/#/viewer/editor?{urlencode(encode_object, doseq=True)}")
    element.set('height', f'{int(prev_height if prev_height else 204) + 411}px')
    element.set('width', f'100%')
    element.set('style', 'opacity: 0;')
    element.set('allowfullscreen', 'true')

    return self.md.htmlStash.store(etree.tostring(element, encoding='unicode', short_empty_elements=False))

class ElementDocsExtension(Extension):
  def __init__(self, *args, **kwargs):
    """Initialize."""
    self.config = {
      'examples_base': ['', 'Base URL for the examples.'],
      'md_file': ['', 'Helper for accessing the MkDocs config (set via !relative).']
    }
    super().__init__(*args, **kwargs)

  def extendMarkdown(self, md):
    """Add Tabbed to Markdown instance."""
    # Extract current page path
    md_file_list = self.config.get('md_file', [''])
    md_file_cfg = md_file_list[0] if md_file_list else ''
    mkdocs_config = getattr(md_file_cfg, 'config', None)
    current_page = getattr(mkdocs_config, '_current_page', None)
    page_file = getattr(current_page, 'file', None)
    page_path = getattr(page_file, 'src_uri', '') or ''
    docs_dir = getattr(mkdocs_config, 'docs_dir', '') or ''
    md.preprocessors.register(ElementExamplePreProcessor(self.config.get('examples_base')[0], page_path, docs_dir, md), 'element_example', 10)
    md.treeprocessors.register(ElementTabTreeProcessor(md), 'element_tabs', 10)


def makeExtension(*args, **kwargs):
    return ElementDocsExtension(*args, **kwargs)
