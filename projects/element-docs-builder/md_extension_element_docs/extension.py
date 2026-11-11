import re

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

class ElementExamplePreProcessor(Preprocessor):
  def run(self, lines):
    escape_regex = re.compile(r'.*`.*`.*')
    lines_processed = []
    line_processing_buffer = []
    for line in lines:

      if escape_regex.match(line):
        lines_processed.append(line)
        continue

      match_start = '<si-docs-component' in line
      match_end = '</si-docs-component>' in line
      if match_start and match_end:
        lines_processed.append(self.md.htmlStash.store(line))
        line_processing_buffer.clear()
      elif match_start:
        line_processing_buffer.append(line)
      elif match_end:
        line_processing_buffer.append(line)
        lines_processed.append(self.md.htmlStash.store(''.join(line_processing_buffer)))
        line_processing_buffer.clear()
      elif len(line_processing_buffer) > 0:
        line_processing_buffer.append(line)
      else:
        lines_processed.append(line)

    return lines_processed

class ElementDocsExtension(Extension):
  def extendMarkdown(self, md):
    """Add Element examples and tab Markdown to the Markdown instance."""
    md.preprocessors.register(ElementExamplePreProcessor(md), 'element_example', 10)
    # Run after code fences and HTML are stashed so their headings stay untouched.
    md.preprocessors.register(ElementTabPreProcessor(md), 'element_tabs', 5)


def makeExtension(*args, **kwargs):
    return ElementDocsExtension(*args, **kwargs)
