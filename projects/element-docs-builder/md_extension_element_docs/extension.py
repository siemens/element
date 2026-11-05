import re
from abc import abstractmethod

from markdown import Extension
from markdown.preprocessors import Preprocessor


class ElementTabPreProcessor(Preprocessor):
  def run(self, lines):
    tab_heading = re.compile(r'^ {0,3}##[ \t]+(.+?)[ \t]*---[ \t]*(?:#+[ \t]*)?$')
    # Keep any existing Blocks syntax nested inside the generated tabs.
    fences = [match[1] for line in lines if (match := re.match(r'^ {0,3}(/{3,})', line))]
    fence = max(fences, key=len, default='//') + '/'
    processed_lines = []
    in_tab = False

    for line in lines:
      match = tab_heading.match(line)
      if match:
        if in_tab:
          processed_lines.extend(['', fence, ''])
        title = match[1].strip()
        # Retain headings for existing deep links and the table of contents.
        processed_lines.extend([f'{fence} tab | {title}', '', f'## {title} {{.tab-anchor}}', ''])
        in_tab = True
      else:
        processed_lines.append(line)

    if in_tab:
      processed_lines.extend(['', fence, ''])

    return processed_lines

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
    """Add Element examples and tab Markdown to the Markdown instance."""
    md.preprocessors.register(ElementExamplePreProcessor(md), 'element_example', 10)
    # Run after code fences and HTML are stashed so their headings stay untouched.
    md.preprocessors.register(ElementTabPreProcessor(md), 'element_tabs', 5)


def makeExtension(*args, **kwargs):
    return ElementDocsExtension(*args, **kwargs)
