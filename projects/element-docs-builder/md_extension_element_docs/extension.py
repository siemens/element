import re
import xml.etree.ElementTree as etree
from abc import abstractmethod
from html import escape
from pathlib import Path

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
    lines_processed = []
    line_processing_buffer = []
    for line in lines:

      if escape_regex.match(line):
        lines_processed.append(line)
        continue

      match_start = f'<{self.tag_name}' in line
      match_end = f'</{self.tag_name}>' in line
      if match_start and match_end:
        lines_processed.append(self.convert_tag(line))
        line_processing_buffer.clear()
      elif match_start:
        line_processing_buffer.append(line)
      elif match_end:
        line_processing_buffer.append(line)
        lines_processed.append(self.convert_tag('\n'.join(line_processing_buffer)))
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

  def source_html(self, example: str) -> str:
    blocks = []
    for extension, language in (('html', 'html'), ('ts', 'typescript')):
      path = Path('src/app/examples') / f'{example}.{extension}'
      # Inline-template examples have no separate HTML file.
      if extension == 'html' and not path.is_file():
        continue
      source = escape(path.read_text(encoding='utf-8'), quote=False)
      blocks.append(
        f'<div class="highlight"><span class="filename">{escape(example)}.{extension}</span>'
        f'<pre><code class="language-{language}">{source}</code></pre></div>'
      )
    return ''.join(blocks)

  def convert_tag(self, line) -> str:
    base_match = re.search(r'\bbase\s*=\s*(["\'])(.*?)\1', line.split('>', 1)[0])
    base = base_match[2].rstrip('/') + '/' if base_match else ''

    def inject_source(match: re.Match[str]) -> str:
      example = re.search(r'\bexample\s*=\s*(["\'])(.*?)\1', match[0])
      return match[0] + self.source_html(base + example[2]) if example else match[0]

    html = re.sub(r'<si-docs-(?:component|tab)\b[^>]*>', inject_source, line)
    return self.md.htmlStash.store(html)

class ElementDocsExtension(Extension):
  def extendMarkdown(self, md):
    """Add documentation tabs and static example sources to Markdown."""
    md.block_level_elements.append('si-docs-component')
    # Run after fenced code extraction, but before raw HTML stashing.
    md.preprocessors.register(ElementExamplePreProcessor(md), 'element_example', 21)
    md.treeprocessors.register(ElementTabTreeProcessor(md), 'element_tabs', 10)


def makeExtension(*args, **kwargs):
    return ElementDocsExtension(*args, **kwargs)
