"""Bundled callback for Zensical's export-only HTML preprocessing."""

from zensical.config import get_config

from .renderer import load_renderer
from .settings import load_settings
from .structured import preprocess_api
from .structured_content import preprocess_content
from .structured_examples import preprocess_examples


def preprocess(html, output):
  settings = load_settings(get_config())
  if not settings.enabled:
    return html
  renderer = load_renderer(settings.artifact_path)
  html = preprocess_examples(html, settings.examples_dir)
  html = preprocess_content(html, output, settings.site_url)
  # Insert API links last so content normalization does not make them absolute.
  return preprocess_api(html, renderer.adapter.data, output, settings.site_url, renderer=renderer)
