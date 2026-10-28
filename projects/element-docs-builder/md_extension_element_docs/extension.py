import re
import xml.etree.ElementTree as etree
from abc import abstractmethod

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
  def __init__(self, *args, **kwargs):
    super().__init__('si-docs-component', *args, **kwargs)

  def convert_tag(self, line) -> str:
    return self.md.htmlStash.store(line)

class ElementDocsExtension(Extension):
  def extendMarkdown(self, md):
    """Add Tabbed to Markdown instance."""
    md.preprocessors.register(ElementExamplePreProcessor(md), 'element_example', 10)
    md.treeprocessors.register(ElementTabTreeProcessor(md), 'element_tabs', 10)


def makeExtension(*args, **kwargs):
    return ElementDocsExtension(*args, **kwargs)
