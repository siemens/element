"""Zensical Jinja macros for rendering Angular API documentation directly."""

from pathlib import Path

from .adapter import ApiRenderError
from .renderer import load_renderer
from .settings import load_settings


def _require_name(macro: str, name: object) -> str:
  if not isinstance(name, str) or not name.strip():
    raise ApiRenderError(f'{macro}() requires a non-empty symbol name')
  return name


def _optional_text(param: str, value: object) -> str | None:
  if value is None:
    return None
  if not isinstance(value, str) or not value.strip():
    raise ApiRenderError(f'{param} must be a non-empty string')
  return value


def _require_bool(param: str, value: object) -> bool:
  if not isinstance(value, bool):
    raise ApiRenderError(f'{param} must be a boolean')
  return value


def _page_has_types_section(docs_dir: Path, page_path: str) -> bool:
  if not page_path:
    return False
  candidate = docs_dir / page_path
  try:
    return 'api_types(' in candidate.read_text(encoding='utf-8')
  except OSError:
    return False


def define_env(env) -> None:
  """Register API documentation macros on Zensical's Jinja environment."""
  settings = None
  page_renderer = None

  def get_page_renderer():
    nonlocal settings, page_renderer
    if settings is None:
      settings = load_settings(env.conf)
    if not settings.enabled:
      return None
    if page_renderer is None:
      page_path = Path(env.page.path).as_posix() if env.page and env.page.path else ''
      renderer = load_renderer(settings.artifact_path)
      has_types = _page_has_types_section(settings.docs_dir, page_path)
      page_renderer = renderer.for_page(page_path, has_types_section=has_types)
    return page_renderer

  @env.macro
  def api(
    name: str,
    *,
    package: str | None = None,
    heading: str | None = None,
    no_heading: bool = False,
    hide_implicitly_public: bool = False,
  ) -> str:
    """Render API documentation for a component, directive, service, pipe, or class."""
    renderer = get_page_renderer()
    if renderer is None:
      return ''
    return renderer.render_symbol(
      _require_name('api', name),
      mode='api',
      package=_optional_text('package', package),
      heading=_optional_text('heading', heading),
      no_heading=_require_bool('no_heading', no_heading),
      hide_implicitly_public=_require_bool('hide_implicitly_public', hide_implicitly_public),
    )

  @env.macro
  def api_type(
    name: str,
    *,
    package: str | None = None,
    heading: str | None = None,
    no_heading: bool = False,
  ) -> str:
    """Render compact type documentation for a type alias, interface, enum, function, or member."""
    renderer = get_page_renderer()
    if renderer is None:
      return ''
    return renderer.render_symbol(
      _require_name('api_type', name),
      mode='type',
      package=_optional_text('package', package),
      heading=_optional_text('heading', heading),
      no_heading=_require_bool('no_heading', no_heading),
    )

  @env.macro
  def api_types() -> str:
    """Render related types referenced by API embeds on the current page."""
    renderer = get_page_renderer()
    if renderer is None:
      return ''
    return renderer.render_types()
