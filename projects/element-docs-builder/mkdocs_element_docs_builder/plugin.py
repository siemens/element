import os
from os.path import relpath
import json
from typing import Any

from mkdocs.config.base import Config
from mkdocs.plugins import BasePlugin
from mkdocs.structure.files import Files, File

from os.path import dirname

from md_extension_element_docs_composer import DocsComposerExtension

api_enabled = os.environ.get('DOCS_COMPOSER', 'false') in ('true', '1', 'yes', 'y')
api_generate = True if os.environ.get('DOCS_COMPOSER_GENERATE', 'false') in ('true', '1', 'yes', 'y') else (
  False if os.environ.get('DOCS_COMPOSER_GENERATE', 'false') not in ('false', '0', 'no', 'n') else None
)

if api_enabled:
  from javascript import require
  try:
    docs_composer = require('./index.mjs')
  except Exception as e:
    raise ImportError('Failed to import Docs Composer. Ensure it is correctly installed and available in the environment. Make sure you are running version 11.9.0 or later.') from e


class ElementDocsBuilderPlugin(BasePlugin):
  docs_composer_configuration: Any = None
  is_serve = False
  ran_typedoc = False
  generated_nav: Any | None = None
  extension: Any | None = None

  def on_startup(self, command: str, dirty: bool) -> None:
    if not api_enabled:
      return

    if command == 'serve':
      self.is_serve = True

  def on_config(self, config: Config):
    config.get('extra_css').append('docs-builder.css')
    config.get('extra_javascript').append('docs-builder.js')

    if not api_enabled:
      return config

    if self.ran_typedoc:
      if self.generated_nav is not None:
        config['nav'] = self.generated_nav
      return config

    self.ran_typedoc = True

    docs_composer_options = os.environ.get('DOCS_COMPOSER_OPTIONS', '{}')
    if docs_composer_options:
      # Read JSON string from environment variable
      try:
        docs_composer_options = json.loads(docs_composer_options)
      except json.JSONDecodeError:
        raise ValueError('Invalid JSON in DOCS_COMPOSER_OPTIONS environment variable.')
    else:
      docs_composer_options = {}

    self.docs_composer_configuration = docs_composer.runTypedoc(
      docs_composer_options,
      None,
      not self.is_serve and api_generate is not False,
      False,
      self.is_serve,
      timeout=1000 * 60 * 5,  # 5 minutes timeout
    )

    if api_generate:
      _, config['nav'] = docs_composer.getGeneratedFiles(self.docs_composer_configuration, timeout=1000 * 60 * 3) # 3 minutes timeout
      config['nav'] = config['nav'].valueOf()
      self.generated_nav = config['nav']

    # Add the instantiated extension to the config
    if 'markdown_extensions' not in config:
      config['markdown_extensions'] = []

    if not any(isinstance(ext, DocsComposerExtension) for ext in config['markdown_extensions']):
      self.extension = DocsComposerExtension(self.docs_composer_configuration, docs_composer, self.is_serve)
      config['markdown_extensions'].append(
        self.extension
      )

    return config

  def on_page_markdown(
    self, markdown: str, page: Any, config: Config, files: Any
  ) -> str:
    if self.extension is not None:
      # Save the file path (relative to the repo dir) to the extension for later use
      self.extension.current_file_path = relpath(page.file.abs_src_path, os.getcwd())
    return markdown

  def on_post_build(self, config: Config) -> None:
      if not api_enabled:
        return

      if self.extension is not None:
        docs_composer.saveLLMsTxt(
          self.docs_composer_configuration,
          '.',
          timeout=1000 * 60 * 1,  # 1 minute timeout
        )

  def on_files(self, files: Files, config: Config):
    files.append(File('docs-builder.css', dirname(__file__), config.get('site_dir'), config.get('use_directory_urls')))
    files.append(File('docs-builder.js', dirname(__file__), config.get('site_dir'), config.get('use_directory_urls')))
    return files
