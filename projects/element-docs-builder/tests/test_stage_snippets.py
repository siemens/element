"""The fixed site's real snippet engine preserves original source boundaries."""
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from markdown import Markdown
from mkdocs_element_docs_builder.stage_snippets import expand_files


class StageSnippetsTests(unittest.TestCase):
  def setUp(self):
    self.temporary = TemporaryDirectory()
    self.addCleanup(self.temporary.cleanup)
    self.root = Path(self.temporary.name).resolve()

  def write(self, path, source):
    file = self.root / path
    file.parent.mkdir(parents=True, exist_ok=True)
    file.write_text(source, encoding='utf-8', newline='')

  def expand(self, source):
    return expand_files(self.root, [{'path': 'docs/example.md', 'content': source}])[0]['content']

  def test_named_section_uses_real_engine_without_rendering(self):
    self.write('example.ts', '// --8<-- [start:example]\n<si-docs-api name="Example"/>\n// --8<-- [end:example]\nignored\n')
    self.assertEqual(self.expand('--8<-- "example.ts:example"\n'), '<si-docs-api name="Example"/>\n')

  def test_nested_snippets_use_repository_root(self):
    self.write('outer.md', 'outer\n--8<-- "nested/inner.md"')
    self.write('nested/inner.md', '**inner**')
    self.assertEqual(self.expand('--8<-- "outer.md"'), 'outer\n**inner**')

  def test_design_token_docs_are_the_second_static_base(self):
    self.write('node_modules/@siemens-ux/design-tokens/docs/colors.md', 'token source')
    self.assertEqual(self.expand('--8<-- "colors.md"'), 'token source')

  def test_options_are_fixed_and_do_not_load_yaml_or_render_markdown(self):
    self.write('mkdocs.yml', 'extra: !!python/name:missing_module.compat\n')
    real = Markdown
    with patch('mkdocs_element_docs_builder.stage_snippets.Markdown', wraps=real) as markdown:
      self.assertEqual(self.expand('unchanged\n'), 'unchanged\n')
    markdown.assert_called_once_with(extensions=['pymdownx.snippets'], extension_configs={
      'pymdownx.snippets': {'base_path': [str(self.root), str(self.root / 'node_modules/@siemens-ux/design-tokens/docs')]},
    })

  def test_literal_fences_and_original_newlines_are_unchanged(self):
    for source in ['', 'text', 'text\n', 'text\n\n', 'text\r\nnext\r\n', 'before\u2028after\n', '\t text  \n',
      '```html\n<si-docs-api name="Missing"/>\n```\n']:
      with self.subTest(source=source):
        self.assertEqual(self.expand(source), source)

  def test_snippets_inside_fences_keep_original_engine_behavior(self):
    self.write('example.ts', 'const example = true;')
    self.assertEqual(self.expand('```ts\n--8<-- "example.ts"\n```\n'), '```ts\nconst example = true;\n```\n')

  def test_snippet_newlines_match_real_preprocessor(self):
    self.write('example.md', 'included\n')
    md = Markdown(extensions=['pymdownx.snippets'], extension_configs={
      'pymdownx.snippets': {'base_path': [str(self.root), str(self.root / 'node_modules/@siemens-ux/design-tokens/docs')]},
    })
    for source in ['--8<-- "example.md"', '--8<-- "example.md"\n', 'before\n--8<-- "example.md"\nafter\n']:
      with self.subTest(source=source):
        md.reset()
        self.assertEqual(self.expand(source), '\n'.join(md.preprocessors['snippet'].run(source.split('\n'))))

  def test_missing_sources_and_sections_follow_real_defaults(self):
    self.assertEqual(self.expand('before\n--8<-- "missing.md"\nafter\n'), 'before\nafter\n')
    self.write('example.md', 'no section')
    self.assertEqual(self.expand('--8<-- "example.md:missing"'), '')

  def test_remote_downloads_are_disabled(self):
    with patch('urllib.request.urlopen', side_effect=AssertionError('unexpected network request')):
      self.assertEqual(self.expand('--8<-- "https://example.com/snippet.md"'), '')

  def test_batch_resets_recursive_state(self):
    self.write('recursive.md', 'included\n--8<-- "recursive.md"')
    self.assertEqual(expand_files(self.root, [
      {'path': 'docs/a.md', 'content': '--8<-- "recursive.md"'},
      {'path': 'docs/b.md', 'content': '--8<-- "recursive.md"'},
    ]), [{'path': 'docs/a.md', 'content': 'included'}, {'path': 'docs/b.md', 'content': 'included'}])

  def test_io_errors_report_source_identity(self):
    with patch('pymdownx.snippets.SnippetPreprocessor.run', side_effect=OSError('unreadable include')):
      with self.assertRaisesRegex(ValueError, 'docs/example.md: unreadable include'):
        self.expand('--8<-- "example.md"')
