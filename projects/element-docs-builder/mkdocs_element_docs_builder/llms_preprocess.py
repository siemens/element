"""Checked-in entry point for Zensical's export-only HTML preprocessing."""

from pathlib import Path

from zensical.config import get_config

from md_extension_element_api.renderer import API_ARTIFACT, load_renderer
from md_extension_element_api.structured import preprocess_api
from mkdocs_element_docs_builder.structured_content import preprocess_content
from mkdocs_element_docs_builder.structured_examples import preprocess_examples


config = get_config()
root = Path(config['root_dir'])


def preprocess(html, output):
  renderer = load_renderer((root / API_ARTIFACT).resolve())
  site_url = config['site_url']
  html = preprocess_examples(html, root / 'src/app/examples')
  html = preprocess_api(html, renderer.adapter.data, output, site_url, renderer=renderer)
  return preprocess_content(html, output, site_url)
