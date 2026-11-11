"""Native structured bridge input and Composer call/finalization contracts."""
import importlib
import json
import os
from pathlib import Path
from tempfile import TemporaryDirectory
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

from markdown import Markdown
from markdown.preprocessors import Preprocessor
from md_extension_element_docs_composer.extension import DocsComposerExtension
from zensical.extensions.context import ContextExtension, Page

with patch.dict(os.environ, {'DOCS_COMPOSER': 'false'}):
  plugin = importlib.import_module('mkdocs_element_docs_builder.plugin')


class StagedComposerTests(unittest.TestCase):
  def setUp(self):
    self.temporary = TemporaryDirectory()
    self.addCleanup(self.temporary.cleanup)
    self.root = Path(self.temporary.name).resolve()
    self.composer = Mock()
    self.configuration = {'original': 'options'}
    self.extension = DocsComposerExtension(self.configuration, self.composer)

  def write(self, path, source):
    file = self.root / path
    file.parent.mkdir(parents=True, exist_ok=True)
    file.write_text(source, encoding='utf-8', newline='')
    return file

  def render(self, page, source='<div>normalized/rendered input</div>'):
    md = Markdown(extensions=[self.extension])
    class Context(Preprocessor):
      def run(self, lines):
        return lines
    context = Context(md)
    context.page = SimpleNamespace(path=page)
    context.config = {'extra': {'element_docs_root': str(self.root)}, 'docs_dir': '.cache/element-docs/docs'}
    md.preprocessors.register(context, 'rendering_context', 100)
    return md.convert(source)

  def test_authored_expanded_bytes_and_all_original_arguments(self):
    original = '<si-docs-api name="Widget"/>\r\nexpanded snippet\r\n\r\n'
    self.write('.cache/element-docs/docs/components/example.md', original)
    self.assertEqual(self.render('components/example.md'), '<div>normalized/rendered input</div>')
    self.composer.buildFile.assert_called_once_with(self.configuration, original, 'docs/components/example.md',
      False, True, 'source', True, True, timeout=60000)

  def test_native_context_preserves_frontmatter_and_authored_options_before_normalization(self):
    original = '---\r\nsearch:\r\n  exclude: true\r\n---\r\n<si-docs-api component="Widget" hideImplicitlyPublic="true" heading="Original"/>\r\n\r\n'
    self.write('.cache/element-docs/docs/components/example.md', original)
    md = Markdown(extensions=[self.extension, ContextExtension(
      page=Page(path='components/example.md', url='components/example/'),
      config={'extra': {'element_docs_root': str(self.root)}, 'docs_dir': '.cache/element-docs/docs'},
    )])
    md.convert('Native content already has frontmatter removed')
    self.assertEqual(self.composer.buildFile.call_args.args[1], original)

  def test_root_readme_uses_dereferenced_staged_bytes(self):
    self.write('README.md', '# Original root\n\n')
    (self.root / 'docs').mkdir()
    (self.root / 'docs/README.md').symlink_to('../README.md')
    self.write('.cache/element-docs/docs/README.md', '# Original root\n\n')
    self.render('README.md')
    self.assertEqual(self.composer.buildFile.call_args.args[1:3], ('# Original root\n\n', 'docs/README.md'))

  def test_api_uses_expanded_legacy_original_not_staged_reference(self):
    self.write('snippet.md', 'legacy snippet\n')
    self.write('docs/api/test/Widget.md', 'Legacy original\n--8<-- "snippet.md"\n')
    self.write('.cache/element-docs/docs/api/test/Widget.md', '<si-docs-api name="NewRenderer"/>\n')
    self.render('api/test/Widget.md')
    self.assertEqual(self.composer.buildFile.call_args.args[1:3], ('Legacy original\nlegacy snippet\n\n', 'docs/api/test/Widget.md'))

  def test_new_api_exports_do_not_enter_legacy_llm_corpus(self):
    self.write('.cache/element-docs/docs/api/test/New.md', '<si-docs-type name="New"/>')
    self.render('api/test/New.md')
    self.composer.buildFile.assert_not_called()

  def test_missing_authored_source_never_uses_rendered_lines(self):
    with self.assertRaises(FileNotFoundError):
      self.render('components/missing.md')
    self.composer.buildFile.assert_not_called()

  def test_path_traversal_is_rejected(self):
    for path in ('../outside.md', '/outside.md'):
      with self.subTest(path=path), self.assertRaisesRegex(ValueError, 'escapes docs directory'):
        self.render(path)
    self.composer.buildFile.assert_not_called()

  def test_staged_symlinks_cannot_escape_staged_root(self):
    self.write('outside.md', 'outside')
    staged = self.root / '.cache/element-docs/docs'
    staged.mkdir(parents=True)
    (staged / 'escape.md').symlink_to(self.root / 'outside.md')
    with self.assertRaisesRegex(ValueError, 'Staged documentation path escapes'):
      self.render('escape.md')


class StagedBuilderTests(unittest.TestCase):
  def config(self):
    return {'extra_css': [], 'extra_javascript': [], 'markdown_extensions': [], 'mdx_configs': {}, 'extra': {
      'element_docs_api_json': '/repo/.cache/element-docs/api-documentation.json', 'element_docs_api_revision': 'revision',
    }, 'nav': [{'Components': [{'Example': 'components/example.md'}]}]}

  def test_fast_build_retains_css_only_without_loading_composer(self):
    config = self.config()
    with patch.dict(os.environ, {}, clear=True), patch.object(plugin, 'api_enabled', False):
      extension, finalize = plugin.configure(config)
    self.assertIsNone(extension)
    self.assertIsNone(finalize)
    self.assertEqual(config['extra_css'], ['docs-builder.css'])
    self.assertEqual(config['extra_javascript'], [])
    self.assertEqual(config['markdown_extensions'], [])

  def test_native_api_options_are_required_and_serializable(self):
    config = self.config()
    with patch.dict(os.environ, {'ELEMENT_DOCS_API': 'true'}), patch.object(plugin, 'api_enabled', False):
      extension, finalize = plugin.configure(config)
    self.assertIsNone(extension)
    self.assertIsNone(finalize)
    self.assertEqual(config['markdown_extensions'], ['md_extension_element_api.extension'])
    self.assertEqual(config['mdx_configs']['md_extension_element_api.extension'], {
      'artifact_path': '/repo/.cache/element-docs/api-documentation.json', 'artifact_revision': 'revision',
    })
    json.dumps(config)

  def test_both_build_modes_preserve_typedoc_arguments_and_generation_tracking(self):
    options = {'structuredRemoveEncoded': True, 'generatedExcludeGenerated': True, 'original': 'kept'}
    for generate in (False, True):
      composer = Mock()
      composer.runTypedoc.return_value = {'configuration': True}
      config = self.config()
      with self.subTest(generate=generate), patch.dict(os.environ, {'ELEMENT_DOCS_API': 'true', 'DOCS_COMPOSER_OPTIONS': json.dumps(options)}), \
        patch.object(plugin, 'api_enabled', True), patch.object(plugin, 'api_generate', generate), patch.object(plugin, 'docs_composer', composer, create=True):
        extension, finalize = plugin.configure(config)
        self.assertIs(config['markdown_extensions'][-1], extension)
        self.assertIs(extension.docs_composer, composer)
        self.assertIs(extension.docs_composer_configuration, composer.runTypedoc.return_value)
        composer.runTypedoc.assert_called_once_with(options, None, True, False, False, timeout=300000)
        self.assertEqual(composer.getGeneratedFiles.call_count, int(generate))
        self.assertEqual(config['nav'], [{'Components': [{'Example': 'components/example.md'}]}])
        composer.saveLLMsTxt.assert_not_called()
        finalize()
        composer.saveLLMsTxt.assert_called_once_with({'configuration': True}, '.', 'source', timeout=60000)

  def test_native_factory_clones_only_composer_dependencies(self):
    import mkdocs_element_docs_builder.compat_zensical as compat
    composer = Mock()
    original = DocsComposerExtension({'configuration': True}, composer)
    with patch.object(compat, '_COMPOSER_EXTENSION', original):
      clone = compat.makeExtension()
    self.assertIsNot(clone, original)
    self.assertIs(clone.docs_composer_configuration, original.docs_composer_configuration)
    self.assertIs(clone.docs_composer, composer)

  def test_finalizers_retain_their_own_configurations_across_reconfiguration(self):
    composer = Mock()
    first, second = {'revision': 'first'}, {'revision': 'second'}
    composer.runTypedoc.side_effect = [first, second]
    with patch.dict(os.environ, {'DOCS_COMPOSER_OPTIONS': '{}', 'ELEMENT_DOCS_API': 'false'}), \
      patch.object(plugin, 'api_enabled', True), patch.object(plugin, 'api_generate', False), patch.object(plugin, 'docs_composer', composer, create=True):
      first_extension, first_finalize = plugin.configure(self.config())
      second_extension, second_finalize = plugin.configure(self.config())

      composer.saveLLMsTxt.assert_not_called()
      first_finalize()
      second_finalize()

      self.assertIs(first_extension.docs_composer_configuration, first)
      self.assertIs(second_extension.docs_composer_configuration, second)
      self.assertEqual(composer.saveLLMsTxt.call_args_list, [
        unittest.mock.call(first, '.', 'source', timeout=60000),
        unittest.mock.call(second, '.', 'source', timeout=60000),
      ])

  def test_exit_finalization_resets_before_running_and_runs_only_once(self):
    import mkdocs_element_docs_builder.compat_zensical as compat
    def finalize():
      self.assertIsNone(compat._POST_BUILD)
      self.assertIsNone(compat._COMPOSER_EXTENSION)
    callback = Mock(side_effect=finalize)
    with patch.object(compat, '_POST_BUILD', callback), patch.object(compat, '_COMPOSER_EXTENSION', Mock()):
      compat._run_post_build()
      compat._run_post_build()
    callback.assert_called_once_with()
