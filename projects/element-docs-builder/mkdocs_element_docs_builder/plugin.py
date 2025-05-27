import re

from mkdocs.config.base import Config
from mkdocs.config.config_options import Type
from mkdocs.plugins import BasePlugin
from mkdocs.config.defaults import MkDocsConfig
from mkdocs.structure.pages import Page
from mkdocs.structure.files import Files, File

from os.path import dirname

class ElementDocsBuilderPlugin(BasePlugin):
  def on_config(self, config: Config):
    config.get('extra_css').append('docs-builder.css')
    config.get('extra_javascript').append('docs-builder.js')
    return config

  def on_files(self, files: Files, config: Config):
    files.append(File('docs-builder.css', dirname(__file__), config.get('site_dir'), config.get('use_directory_urls')))
    files.append(File('docs-builder.js', dirname(__file__), config.get('site_dir'), config.get('use_directory_urls')))
    return files
