/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { type HighlightOptions } from 'highlight.js';

/** type of a language import */
export type HighlightJSLanguageImport = Promise<
  typeof import('highlight.js/lib/languages/*') | undefined
>;
/** Language loader */
export type HighlightJSLanguageLoader = (lang: string) => HighlightJSLanguageImport;

/** Configuration for the Highlight.js highlighter */
export interface SiMarkdownHighlightJsOptions {
  /** Should language be auto-detected? This only works with already loaded languages */
  autoDetectLanguage?: boolean;
  /**
   * Language loader to load languages lazily.
   * @example
   * ```ts
   * const hljsLanguageLoader = async (lang: string): HighlightJSLanguageImport => {
   *   switch (lang) {
   *     case 'c':
   *       return import('highlight.js/lib/languages/c');
   *     case 'cmake':
   *       return import('highlight.js/lib/languages/cmake');
   *     case 'cpp':
   *       return import('highlight.js/lib/languages/cpp');
   *   }
   *   return undefined;
   * };
   * ```
   */
  languageLoader?: HighlightJSLanguageLoader;
  /** options passed to highlight.js */
  highlightJs?: Partial<HighlightOptions>;
}
