"""Single-file snapshot fixtures: one reviewable file per test or parametrized case."""

import pytest
from syrupy.extensions.single_file import SingleFileSnapshotExtension, WriteMode


class HtmlSnapshot(SingleFileSnapshotExtension):
  _write_mode = WriteMode.TEXT
  file_extension = 'html'


class MarkdownSnapshot(SingleFileSnapshotExtension):
  _write_mode = WriteMode.TEXT
  file_extension = 'md'


@pytest.fixture
def html_snapshot(snapshot):
  return snapshot.use_extension(HtmlSnapshot)


@pytest.fixture
def md_snapshot(snapshot):
  return snapshot.use_extension(MarkdownSnapshot)
