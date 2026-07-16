/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { type HighlightOptions, type LanguageFn } from 'highlight.js';

/** Configuration for the Highlight.js highlighter */
export interface SiMarkdownHighlightJsOptions {
  /** Should language be auto-detected? This only works with already loaded languages */
  autoDetectLanguage?: boolean;
  /**
   * List of languages to eagerly load
   * @example
   * ```
   * [
   *   { name: 'perl', lang: import('highlight.js/lib/languages/perl') }
   * ]
   * ```
   */
  languages?: {
    name: string;
    lang: LanguageFn;
  }[];
  /** options passed to highlight.js */
  highlightJs?: Partial<HighlightOptions>;
}
