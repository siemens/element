"""Mutation tables for the reference-catalog validator."""

import pytest

from md_extension_element_api.adapter import ApiRenderError
from siemens_angular_api_docs_zensical.reference_pages import safe_page_path, validate_reference_pages


def pages(*paths):
  return {'pages': [{'path': path} for path in ('api/index.md', *paths)], 'navigation': []}


CATALOGS = [
  ({'pages': {}, 'navigation': []}, 'pages must be a list'), ({'pages': []}, 'navigation must be a list'),
  ({'pages': [], 'navigation': []}, 'must include api/index.md'),
  (pages('api/a.md', 'api/a.md'), 'duplicate page path'), (pages('api/a.md', 'api/A.md'), 'case-insensitive'),
  (pages('api/a.md', 'api/a.md/b.md'), 'conflicts with a directory'), (pages('api/../x.md'), 'Invalid generated'),
]


@pytest.mark.parametrize('catalog, message', CATALOGS)
def test_validate_reference_pages_rejects(catalog, message):
  with pytest.raises(ApiRenderError, match=message):
    validate_reference_pages(catalog)


def test_reference_pages_accept_valid_catalog_and_reject_unsafe_paths():
  validate_reference_pages(pages('api/a/b.md'))
  for path in [None, 'x/a.md', 'api/a.txt', 'api//a.md', 'api/./a.md', 'api\\a.md', 'api/a b.md', 'api/a?.md', 'api/%2e.md', 'api/a:b.md']:
    with pytest.raises(ApiRenderError):
      safe_page_path(path)
