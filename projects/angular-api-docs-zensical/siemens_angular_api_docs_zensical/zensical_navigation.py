"""Register the bundled stylesheet and prepared API navigation with Zensical."""

from pathlib import Path

import zensical.config as zensical_config

from .settings import load_settings


THEME_DIR = Path(__file__).resolve().parent / 'theme'
STYLESHEET = '_src/docs-builder.css'
MACROS_MODULE = 'siemens_angular_api_docs_zensical.macros'
MACROS_DEFAULTS = {
  # Avoid probing main.py / importing "main" on every page.
  'module_name': '',
  # Keep macros from walking and hashing all of docs_dir into watched_files.
  'include_dir': '.element-docs-macros',
  'on_error_fail': True,
  'j2_variable_start_string': '[[',
  'j2_variable_end_string': ']]',
  'j2_block_start_string': '[%',
  'j2_block_end_string': '%]',
  'j2_comment_start_string': '[#',
  'j2_comment_end_string': '#]',
}


def _configure_macros(config):
  """Register the API macros pluglet and fast, Angular-safe defaults."""
  plugins = config.get('plugins')
  macros = None
  if isinstance(plugins, dict):
    entry = plugins.get('macros')
    if isinstance(entry, dict):
      macros = entry
    else:
      macros = {}
      plugins['macros'] = macros
  else:
    if not isinstance(plugins, list):
      plugins = []
      config['plugins'] = plugins
    for index, item in enumerate(plugins):
      if item == 'macros':
        macros = {}
        plugins[index] = {'macros': macros}
        break
      if isinstance(item, dict) and 'macros' in item:
        macros = item['macros'] if isinstance(item['macros'], dict) else {}
        item['macros'] = macros
        break
    if macros is None:
      macros = {}
      plugins.append({'macros': macros})

  modules = macros.setdefault('modules', [])
  if isinstance(modules, list) and MACROS_MODULE not in modules:
    modules.append(MACROS_MODULE)
  for key, value in MACROS_DEFAULTS.items():
    macros.setdefault(key, value)


def _apply_defaults_with_element_docs(config, path):
  extra = config.get('extra')
  if not isinstance(extra, dict) or extra.pop('element_docs_install', None) is not install:
    return _original_apply_defaults(config, path)
  _configure_macros(config)
  settings = load_settings({**config, 'root_dir': Path(path).resolve().parent})
  if settings.enabled:
    from .reference_pages import load_reference_catalog

    _, catalog = load_reference_catalog(settings.catalog_path, settings.pages_dir)
    for section in config.get('nav', []):
      if isinstance(section, dict) and settings.nav_parent in section:
        section[settings.nav_parent].append({settings.nav_title: catalog['navigation']})
        break
    else:
      raise zensical_config.ConfigurationError(f'Missing {settings.nav_parent} section for API navigation')

    # API embeds depend on prepared JSON even when their Markdown is unchanged.
    # Watch it for cache invalidation and rebuilds only when API mode is enabled.
    artifact = settings.artifact_path
    if artifact.is_relative_to(settings.root_dir):
      artifact = artifact.relative_to(settings.root_dir)
    config.setdefault('watch', []).append(str(artifact))

  config = _original_apply_defaults(config, path)
  # Zensical publishes assets from its resolved theme directories as well as
  # docs_dir. Add ours as a fallback without replacing the site's theme.
  config['theme_dirs'].append(str(THEME_DIR))
  if STYLESHEET not in config['extra_css']:
    config['extra_css'].insert(0, STYLESHEET)
  return config


def install() -> None:
  """Install the Element docs hook once, before Zensical normalizes the config."""
  global _original_apply_defaults
  apply_defaults = getattr(zensical_config, '_apply_defaults', None)
  if not callable(apply_defaults):
    raise zensical_config.ConfigurationError(
      'Element docs requires zensical>=0.1.2,<0.2 with a callable zensical.config._apply_defaults'
    )
  if apply_defaults is _apply_defaults_with_element_docs:
    return
  _original_apply_defaults = apply_defaults
  zensical_config._apply_defaults = _apply_defaults_with_element_docs


# The YAML tag imports the module but does not call the named function.
install()
