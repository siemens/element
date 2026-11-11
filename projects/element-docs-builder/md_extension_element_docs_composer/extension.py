"""Send original Markdown to Composer for structured output, never site HTML."""
import os
from pathlib import Path

from markdown.extensions import Extension
from markdown.preprocessors import Preprocessor

from mkdocs_element_docs_builder.stage_snippets import expand_files


structured_output_path = 'source'


class DocsComposerExtension(Extension):
  def __init__(self, docs_composer_configuration, docs_composer):
    super().__init__()
    self.docs_composer_configuration = docs_composer_configuration
    self.docs_composer = docs_composer

  def extendMarkdown(self, md):
    md.preprocessors.register(DocsComposerPreprocessor(md, self), 'docscomposer', 31)


class DocsComposerPreprocessor(Preprocessor):
  def __init__(self, md, extension):
    super().__init__(md)
    self.extension = extension

  def run(self, lines):
    context = self.md.preprocessors['rendering_context']
    root = Path(context.config['extra']['element_docs_root']).resolve()
    page = Path(context.page.path)
    original_docs = root / 'docs'
    # Lexical containment permits authored README/DEVELOPER symlinks to root.
    original = Path(os.path.abspath(original_docs / page))
    if not original.is_relative_to(original_docs):
      raise ValueError(f'Documentation path escapes docs directory: {page}')
    identity = (Path('docs') / page).as_posix()
    if page.parts[0] == 'api':
      if not original.exists():
        # New reference exports have no legacy structured/LLM source.
        return lines
      with original.open(encoding='utf-8', newline='') as stream:
        source = expand_files(root, [{'path': identity, 'content': stream.read()}])[0]['content']
    else:
      staged_docs = (root / context.config['docs_dir']).resolve()
      staged = (staged_docs / page).resolve()
      if not staged.is_relative_to(staged_docs):
        raise ValueError(f'Staged documentation path escapes docs directory: {page}')
      # Read the expanded authored bytes before Markdown normalizes newlines.
      with staged.open(encoding='utf-8', newline='') as stream:
        source = stream.read()
    self.extension.docs_composer.buildFile(
      self.extension.docs_composer_configuration,
      source, identity, False, True, structured_output_path, True, True,
      timeout=1000 * 60,
    )
    return lines
