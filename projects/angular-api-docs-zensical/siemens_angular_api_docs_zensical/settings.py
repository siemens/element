"""Shared configuration for generating and rendering API documentation."""

from collections.abc import Mapping
from dataclasses import dataclass
from pathlib import Path
import re

from zensical.config import ConfigurationError, parse_mkdocs_config


DEFAULT_PAGES_DIR = 'api'


@dataclass(frozen=True)
class ElementDocsSettings:
  root_dir: Path
  docs_dir: Path
  site_url: str | None
  enabled: bool
  artifact_dir: Path
  pages_dir: str
  nav_parent: str
  nav_title: str
  examples_dir: Path

  @property
  def artifact_path(self) -> Path:
    return self.artifact_dir / 'api-documentation.json'

  @property
  def catalog_path(self) -> Path:
    return self.artifact_dir / 'api-reference-pages.json'


def load_settings(config: Mapping[str, object]) -> ElementDocsSettings:
  """Read package settings from the site config without mutating it."""
  def section(parent: Mapping[str, object], key: str) -> Mapping[str, object]:
    value = parent.get(key, {})
    if not isinstance(value, Mapping):
      raise ConfigurationError(f'{key} must be a mapping')
    return value

  def text(parent: Mapping[str, object], key: str, default: str) -> str:
    value = parent.get(key, default)
    if not isinstance(value, str) or not value.strip():
      raise ConfigurationError(f'{key} must be a non-empty string')
    return value

  element = section(section(config, 'extra'), 'element_docs')
  api = section(element, 'api')
  export = section(element, 'export')
  enabled = api.get('enabled', False)
  if not isinstance(enabled, bool):
    raise ConfigurationError('element_docs.api.enabled must be a boolean')
  pages_dir = text(api, 'pages_dir', DEFAULT_PAGES_DIR)
  if (re.search(r'[\x00-\x20\x7f\\?#:%]', pages_dir)
      or any(part in ('', '.', '..') for part in pages_dir.split('/'))):
    raise ConfigurationError('element_docs.api.pages_dir must be a safe path relative to docs_dir')
  site_url = config.get('site_url')
  if site_url is not None and not isinstance(site_url, str):
    raise ConfigurationError('site_url must be a string')
  root = config.get('root_dir', '.')
  if not isinstance(root, (str, Path)):
    raise ConfigurationError('root_dir must be a filesystem path')
  root_dir = Path(root).resolve()
  return ElementDocsSettings(
    root_dir=root_dir,
    # Keep the docs path lexical so publication can reject a symlink.
    docs_dir=root_dir / text(config, 'docs_dir', 'docs'),
    site_url=site_url,
    enabled=enabled,
    artifact_dir=(root_dir / text(api, 'artifact_dir', 'dist/api-docs')).resolve(),
    pages_dir=pages_dir,
    nav_parent=text(api, 'nav_parent', 'Components'),
    nav_title=text(api, 'nav_title', 'API'),
    examples_dir=(root_dir / text(export, 'examples_dir', 'src/app/examples')).resolve(),
  )


def load_settings_from_file(path: Path = Path('mkdocs.yml')) -> ElementDocsSettings:
  return load_settings(parse_mkdocs_config(str(path.resolve())))
