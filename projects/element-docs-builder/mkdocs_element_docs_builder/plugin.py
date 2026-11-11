"""Native Zensical configuration and structured Composer finalization."""
import json
import os

from md_extension_element_docs_composer.extension import DocsComposerExtension, structured_output_path


api_enabled = os.environ.get('DOCS_COMPOSER') == 'true'
api_generate = os.environ.get('DOCS_COMPOSER_GENERATE') == 'true'

if api_enabled:
  from javascript import require
  try:
    docs_composer = require('./index.mjs')
  except Exception as error:
    raise ImportError('Failed to import Docs Composer. Ensure version 11.9.0 or later is installed.') from error


def apply_staged_navigation(config):
  """Insert the prepared API subtree, never Composer's legacy navigation."""
  nav = config['extra']['element_api_nav']
  for section in config['nav']:
    if 'Components' in section:
      entries = section['Components']
      entries[:] = [entry for entry in entries if not isinstance(entry, dict) or 'API' not in entry]
      entries.append({'API': nav})
      return
  raise ValueError('Missing Components navigation section')


def apply_staged_markdown(config):
  """Staging already expanded snippets; do not expand them twice."""
  config['markdown_extensions'] = [
    entry for entry in config['markdown_extensions']
    if not (isinstance(entry, dict) and 'pymdownx.snippets' in entry)
  ]


def apply_api_markdown(config):
  name = 'md_extension_element_api.extension'
  extra = config['extra']
  config['mdx_configs'][name] = {
    'artifact_path': extra['element_docs_api_json'],
    'artifact_revision': extra['element_docs_api_revision'],
  }
  config['markdown_extensions'].append(name)


def configure(config):
  """Configure native rendering and return its Composer extension and finalizer."""
  if os.environ.get('ELEMENT_DOCS_API') == 'true':
    apply_api_markdown(config)
  config['extra_css'].append('docs-builder.css')
  if not api_enabled:
    return None, None

  try:
    options = json.loads(os.environ['DOCS_COMPOSER_OPTIONS'])
  except json.JSONDecodeError as error:
    raise ValueError('Invalid JSON in DOCS_COMPOSER_OPTIONS environment variable.') from error
  configuration = docs_composer.runTypedoc(
    options, None, True, False, False,
    timeout=1000 * 60 * 5,
  )
  if api_generate:
    # Preserve ORIGINAL docs/api generation and its legacy LLM tracking.
    docs_composer.getGeneratedFiles(configuration, timeout=1000 * 60 * 3)
  extension = DocsComposerExtension(configuration, docs_composer)
  config['markdown_extensions'].append(extension)

  def finalize():
    docs_composer.saveLLMsTxt(
      configuration, '.', structured_output_path,
      timeout=1000 * 60,
    )

  return extension, finalize
