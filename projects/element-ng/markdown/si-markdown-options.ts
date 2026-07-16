/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { type Root } from 'mdast';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { Processor, unified, type Plugin } from 'unified';

import { siMarkdownCode } from './extensions/code';
import { siMarkdownInlineHtml } from './extensions/inline-html';
import {
  PluginWithOptions,
  SiMarkdownExtension,
  SiMarkdownHighlighter,
  TypeHandler,
  UnifiedPlugin
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
  private highlighter?: SiMarkdownHighlighter;

  constructor() {
    this.installExtension(siMarkdownInlineHtml()).installExtension(
      siMarkdownCode({ getHighlighter: () => this.getHighlighter() })
    );
  }

  /**
   * Installs a plugin into the `unified` chain
   * @param plugin - The `unified` plugin
   * @param options - Options for the plugin
   * @returns self for chaining
   */
  installUnifiedPlugin(plugin: UnifiedPlugin, options?: any): SiMarkdownOptions {
    this.plugins.push({ plugin, options });
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
  makeProcessor(): Processor<Root, undefined, undefined, undefined, undefined> {
    const processor = unified().use(remarkParse).use(remarkGfm);

    for (const p of this.plugins) {
      processor.use(p.plugin as Plugin, p.options);
    }

    return processor;
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
