"""Prepare API documentation for a Zensical site."""

import argparse
from pathlib import Path
import sys

from zensical.config import ConfigurationError

from .reference_pages import generate_reference_pages
from .settings import load_settings_from_file


def main(argv: list[str] | None = None) -> int:
  parser = argparse.ArgumentParser(description=__doc__)
  subcommands = parser.add_subparsers(required=True)
  help_text = 'Generate reference Markdown from the prepared catalog'
  pages = subcommands.add_parser('generate-pages', help=help_text, description=help_text)
  pages.add_argument('--config', type=Path, default=Path('mkdocs.yml'), help='Zensical config file (default: mkdocs.yml)')
  args = parser.parse_args(argv)
  try:
    settings = load_settings_from_file(args.config)
    generate_reference_pages(settings)
  except (ConfigurationError, OSError, ValueError, KeyError) as error:
    print(f'{parser.prog} generate-pages: {error}', file=sys.stderr)
    return 1
  return 0
