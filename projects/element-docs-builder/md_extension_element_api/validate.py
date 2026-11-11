"""Validate prepared tags before publishing a stage; do not replace source tags."""

from .adapter import PresentationAdapter, ApiRenderError
from .extension import parse_requests


def validate_pages(presentation, files):
  adapter = PresentationAdapter(presentation)
  errors = []
  for file in files:
    try:
      for request in parse_requests(file['content']):
        if request['mode'] != 'types':
          adapter.select(request['name'], request.get('package'), request['mode'])
    except ApiRenderError as error:
      errors.append(f'{file["path"]}: {error}')
  if errors:
    raise ApiRenderError('\n'.join(errors))
