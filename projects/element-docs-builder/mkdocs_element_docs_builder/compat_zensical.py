"""Install the site's native config wrapper once, when MkDocs YAML imports it."""
import atexit
import shutil
from pathlib import Path
from tempfile import TemporaryDirectory
from typing import Any, Callable

import zensical.config as zensical_config

from md_extension_element_docs_composer.extension import DocsComposerExtension

from .plugin import configure, apply_staged_navigation, apply_staged_markdown
from .preparation import prepare_config


_apply_defaults = zensical_config._apply_defaults
_TEMP_DIR: TemporaryDirectory[str] | None = None
_COMPOSER_EXTENSION: DocsComposerExtension | None = None
_POST_BUILD: Callable[[], None] | None = None


def _run_post_build() -> None:
  global _POST_BUILD, _COMPOSER_EXTENSION
  callback = _POST_BUILD
  _POST_BUILD = None
  _COMPOSER_EXTENSION = None
  if callback is not None:
    callback()


def makeExtension() -> DocsComposerExtension:
  if _COMPOSER_EXTENSION is None:
    raise RuntimeError('Docs Composer has not been initialized')
  return DocsComposerExtension(
    _COMPOSER_EXTENSION.docs_composer_configuration,
    _COMPOSER_EXTENSION.docs_composer,
  )


def _apply_defaults_with_element_docs(
  config: dict[str, Any], path: str
) -> dict[str, Any]:
  global _POST_BUILD, _COMPOSER_EXTENSION, _TEMP_DIR
  # A failing config load must not finalize the previous successful config.
  _POST_BUILD = None
  _COMPOSER_EXTENSION = None
  # Preparation precedes native page discovery and navigation normalization.
  if prepare_config(config, path):
    apply_staged_navigation(config)
    apply_staged_markdown(config)
  result = _apply_defaults(config, path)
  _COMPOSER_EXTENSION, finalize = configure(result)
  if _COMPOSER_EXTENSION is not None:
    result['markdown_extensions'] = [
      __name__ if extension is _COMPOSER_EXTENSION else extension
      for extension in result['markdown_extensions']
    ]

  if _TEMP_DIR is None:
    _TEMP_DIR = TemporaryDirectory()
  template_dir = Path(_TEMP_DIR.name)
  package_dir = Path(__file__).parent
  shutil.copyfile(package_dir / 'docs-builder.css', template_dir / 'docs-builder.css')
  result['theme_dirs'].append(str(template_dir))
  result['theme']['static_templates'].append('docs-builder.css')
  theme_files = zensical_config._list_templates(result)
  result['template_hash'] = zensical_config._hash(theme_files)
  result['mdx_configs_hash'] = zensical_config._hash(result['mdx_configs'])
  _POST_BUILD = finalize
  return result


zensical_config._apply_defaults = _apply_defaults_with_element_docs
# Finalize at exit, after rendering and before the bridge's earlier shutdown.
atexit.register(_run_post_build)
compat = True  # Required YAML import pointer; module caching installs only once.
