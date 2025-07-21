import os


from markdown.extensions import Extension
from markdown.preprocessors import Preprocessor


api_enabled = os.environ.get('DOCS_COMPOSER', 'false') in ('true', '1', 'yes', 'y')


class DocsComposerExtension(Extension):
  current_file_path: str = ""

  def __init__(self, docs_composer_configuration, docs_composer, is_serve, **kwargs):
    super().__init__(**kwargs)
    self.docs_composer_configuration = docs_composer_configuration
    self.docs_composer = docs_composer
    self.is_serve = is_serve

  def extendMarkdown(self, md):
    md.preprocessors.register(
      DocsComposerPreprocessor(md, self),
      'docscomposer',
      31,  # Register after snippets and before other preprocessors
    )


class DocsComposerPreprocessor(Preprocessor):
  def __init__(self, md, extension: DocsComposerExtension):
    super().__init__(md)
    self.extension = extension

  def run(self, lines):
    if api_enabled:
      source = '\n'.join(lines)
      processed_text: str = self.extension.docs_composer.buildFile(
        self.extension.docs_composer_configuration,
        source,
        self.extension.current_file_path,
        self.extension.is_serve,
        True,
        'source',
        True,
        True,
        timeout=1000 * 60 * 1,  # 1 minute timeout
      )
      return processed_text.splitlines()
    return lines


def makeExtension(*args, **kwargs):
    return DocsComposerExtension(*args, **kwargs)
