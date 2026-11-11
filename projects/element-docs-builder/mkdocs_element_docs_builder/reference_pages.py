"""Render producer-prepared reference pages without regrouping or routing them."""

from pathlib import Path
import re

from jinja2 import Environment, FileSystemLoader, StrictUndefined

from md_extension_element_api.adapter import ApiRenderError, safe_url


TEMPLATE_DIR = Path(__file__).parent / 'templates'


def safe_page_path(value):
  if (not isinstance(value, str) or not value.startswith('api/') or not value.endswith('.md')
      or re.search(r'[\x00-\x20\x7f\\?#:%]', value)
      or any(part in ('', '.', '..') for part in value.split('/'))):
    raise ApiRenderError(f'Invalid generated documentation path: {value!r}')
  return value


def render_reference_pages(references):
  # Markdown prose must NOT be HTML-escaped. Explicit |e applies only to tag
  # attributes; README normalization and symbol heading semantics belong to TS.
  environment = Environment(loader=FileSystemLoader(TEMPLATE_DIR), autoescape=False,
    undefined=StrictUndefined, keep_trailing_newline=True)
  environment.globals['safe_url'] = safe_url
  return [{'path': 'docs/' + safe_page_path(page['path']), 'content': environment.get_template(
    page['kind'] + '.md.jinja').render(page=page)} for page in references['pages']]
