/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { SiMarkdownHighlighter } from '../../si-markdown.types';
import { SiMarkdownHightlightJsComponent } from './si-markdown-highlightjs.component';
import { SiMarkdownHighlightJsOptions } from './si-markdown-highlightjs.types';

/**
 * Code highlighter using Highlight.js
 * @param options - Options passed to highlight.js
 * @returns highlighter configuration for `SiMarkdownOptions.setCodeHighlighter()`
 */
export const siMarkdownHighlightJs = (
  options?: SiMarkdownHighlightJsOptions
): SiMarkdownHighlighter => {
  return {
    component: SiMarkdownHightlightJsComponent,
    options
  };
};
