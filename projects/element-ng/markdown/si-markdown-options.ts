/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { type Root } from 'mdast';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { Processor, unified, type Plugin } from 'unified';

import { siMarkdownCalloutDirective } from './directives/callout';
import { siMarkdownCode } from './extensions/code';
import { siMarkdownDirective } from './extensions/directive/si-markdown-directive.extension';
import { siMarkdownInlineHtml } from './extensions/inline-html';
import { siMarkdownLink } from './extensions/link';
import { siMarkdownTable } from './extensions/table';
import { siMarkdownPostprocess } from './internal/si-markdown-postprocess';
import {
  PluginWithOptions,
  SiMarkdownExtension,
  SiMarkdownHighlighter,
  SiMarkdownMetadata,
  SiMarkdownRoot,
  TypeHandler,
  UnifiedPlugin,
  UnifiedPluginOptions
} from './si-markdown.types';

/**
 * Options for the markdown renderer. This holds all configuration and allows installing
 * extensions. A number of extensions are already ready to use and shipped with Element.
 *
 * @example
 * ```ts
 * import { siMarkdownMathKaTeX } from '@siemens/element-ng/markdown/extensions/math';
 * import remarkGemoji from 'remark-gemoji';
 *
 * protected markdownOptions = new SiMarkdownOptions()
 *   .installExtension(siMarkdownMathKaTeX())
 *   .installUnifiedPlugin(remarkGemoji);
 * ```
 *
 * ```html
 * <si-markdown [markdown]="markdownText()" [options]="markdownOptions" />
 * ```
 */
export class SiMarkdownOptions {
  private readonly plugins: PluginWithOptions[] = [];
  private types: TypeHandler[] = [];
  private codeTypes = new Map<string, TypeHandler>();
  private directives = new Map<string, TypeHandler>();
  private highlighter?: SiMarkdownHighlighter;

  constructor() {
    this.installExtension(siMarkdownInlineHtml())
      .installExtension(siMarkdownLink())
      .installExtension(siMarkdownTable())
      .installExtension(siMarkdownCode({ getHighlighter: () => this.getHighlighter() }))
      .installExtension(siMarkdownDirective(this.directives))
      .registerDirective(siMarkdownCalloutDirective());
  }

  /**
   * Installs a plugin into the `unified` chain
   * @param plugin - The `unified` plugin
   * @param options - Options for the plugin
   * @returns self for chaining
   */
  installUnifiedPlugin(plugin: UnifiedPlugin, options?: UnifiedPluginOptions): SiMarkdownOptions {
    this.plugins.push({ plugin, options });
    return this;
  }

  /**
   * Registers a component used to render a named Markdown directive.
   * @param directive - The directive with name and handling component
   * @returns self for chaining
   */
  registerDirective(directives: TypeHandler | TypeHandler[]): SiMarkdownOptions {
    if (!Array.isArray(directives)) {
      directives = [directives];
    }
    for (const directive of directives) {
      this.directives.set(directive.type, directive);
    }
    return this;
  }

  /**
   * Installs a extension which can contain plugins, type handlers
   * @param extension - The extension definition
   * @returns self for chaining
   */
  installExtension(extension: SiMarkdownExtension): SiMarkdownOptions {
    if (extension.plugins) {
      this.plugins.push(...extension.plugins);
    }
    if (extension.types) {
      this.types.push(...extension.types);
    }
    if (extension.codeTypes) {
      for (const ct of extension.codeTypes) {
        this.codeTypes.set(ct.type, ct);
      }
    }
    if (extension.directives) {
      this.registerDirective(extension.directives);
    }
    return this;
  }

  /**
   * Sets the code highlighter
   * @param highlighter - The highlighter
   */
  setCodeHighlighter(highlighter?: SiMarkdownHighlighter): SiMarkdownOptions {
    this.highlighter = highlighter;
    return this;
  }

  /**
   * Creates the `unified` processor with all plugins and options
   * @returns `unified` processor
   */
  makeProcessor(
    meta: SiMarkdownMetadata
  ): Processor<Root, Root, SiMarkdownRoot, undefined, undefined> {
    const processor = unified().use(remarkParse).use(remarkGfm).use(remarkDirective);

    for (const p of this.plugins) {
      const options = typeof p.options === 'function' ? p.options(meta) : p.options;
      processor.use(p.plugin as Plugin, options);
    }

    return processor.use(siMarkdownPostprocess);
  }

  /**
   * @returns All type handlers
   */
  getTypeHandlers(): TypeHandler[] {
    return this.types;
  }

  /**
   * @returns All code type handlers
   */
  getCodeTypeHandlers(): Map<string, TypeHandler> {
    return this.codeTypes;
  }

  /**
   * @returns The highlighter
   */
  getHighlighter(): SiMarkdownHighlighter | undefined {
    return this.highlighter;
  }
}

export const makeSiMarkdownOptions = (): SiMarkdownOptions => new SiMarkdownOptions();
