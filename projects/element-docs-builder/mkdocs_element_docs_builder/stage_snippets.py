"""Expand source snippets with the site's fixed native Markdown engine options."""
from pathlib import Path

from markdown import Markdown


def expand_files(root_dir: str | Path, files: list[dict[str, str]]) -> list[dict[str, str]]:
  root = Path(root_dir).resolve()
  md = Markdown(
    extensions=['pymdownx.snippets'],
    extension_configs={'pymdownx.snippets': {
      'base_path': [str(root), str(root / 'node_modules/@siemens-ux/design-tokens/docs')],
    }},
  )
  expanded = []
  for file in files:
    md.reset()
    try:
      # Preserve final newlines and literal source; never normalize/render here.
      lines = md.preprocessors['snippet'].run(file['content'].split('\n'))
    except Exception as error:
      raise ValueError(f"{file['path']}: {error}") from error
    expanded.append({'path': file['path'], 'content': '\n'.join(lines)})
  return expanded
