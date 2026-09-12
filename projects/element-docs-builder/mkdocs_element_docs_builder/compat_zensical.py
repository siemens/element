import shutil
import sys
from pathlib import Path
from tempfile import TemporaryDirectory
from typing import Any

from md_extension_element_docs_composer import DocsComposerExtension

from .plugin import ElementDocsBuilderPlugin

PATCH_MARKER = '_mkdocs_element_docs_builder_patch'

_TEMP_DIR: TemporaryDirectory[str] | None = None
_COMPOSER_EXTENSION: DocsComposerExtension | None = None


def makeExtension(**kwargs: Any) -> DocsComposerExtension:
  if _COMPOSER_EXTENSION is None:
    raise RuntimeError('Docs Composer has not been initialized')
  return DocsComposerExtension(
    _COMPOSER_EXTENSION.docs_composer_configuration,
    _COMPOSER_EXTENSION.docs_composer,
    _COMPOSER_EXTENSION.is_serve,
    **kwargs,
  )


def _construct_relative(loader: Any, node: Any) -> str:
  return loader.construct_scalar(node)


def _patch_zensical_config() -> bool:
  zensical_config = sys.modules.get('zensical.config')
  if zensical_config is None:
    return False

  zensical_config.Loader.add_constructor('!relative', _construct_relative)
  apply_defaults = getattr(zensical_config, '_apply_defaults')
  if getattr(apply_defaults, PATCH_MARKER, False):
    return True

  def apply_defaults_with_element_docs(
    config: dict[str, Any], path: str
  ) -> dict[str, Any]:
    result = apply_defaults(config, path)
    if 'element-docs-builder' not in result['plugins']:
      return result

    plugin = ElementDocsBuilderPlugin()
    plugin.on_startup('serve' if 'serve' in sys.argv[1:] else 'build', False)
    nav = result.get('nav')
    result = plugin.on_config(result)
    global _COMPOSER_EXTENSION
    _COMPOSER_EXTENSION = plugin.extension
    if _COMPOSER_EXTENSION is not None:
      result['markdown_extensions'] = [
        __name__ if extension is _COMPOSER_EXTENSION else extension
        for extension in result['markdown_extensions']
      ]
    if result.get('nav') != nav:
      result['nav'] = getattr(zensical_config, '_convert_nav')(result['nav'])
    result['extra_javascript'] = getattr(
      zensical_config, '_convert_extra_javascript'
    )(result['extra_javascript'])

    global _TEMP_DIR
    if _TEMP_DIR is None:
      _TEMP_DIR = TemporaryDirectory()

    template_dir = Path(_TEMP_DIR.name)
    package_dir = Path(__file__).parent
    for asset in ('docs-builder.css', 'docs-builder.js'):
      shutil.copyfile(package_dir / asset, template_dir / asset)

    result['theme_dirs'].append(str(template_dir))
    result['theme']['static_templates'].extend(
      ['docs-builder.css', 'docs-builder.js']
    )
    theme_files = getattr(zensical_config, '_list_templates')(result)
    result['template_hash'] = getattr(zensical_config, '_hash')(theme_files)
    result['mdx_configs_hash'] = getattr(zensical_config, '_hash')(
      result['mdx_configs']
    )
    result['plugins_hash'] = getattr(zensical_config, '_hash')(result['plugins'])
    return result

  setattr(apply_defaults_with_element_docs, PATCH_MARKER, True)
  setattr(zensical_config, '_apply_defaults', apply_defaults_with_element_docs)
  return True


compat = _patch_zensical_config()
