/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { makeSiMarkdownOptions } from '@siemens/element-ng/markdown';
import { siMarkdownMathKaTeX } from '@siemens/element-ng/markdown/extensions/katex';
import { siMarkdownHighlightJs } from '@siemens/element-ng/markdown/hightlighter/highlightjs';
import remarkGemoji from 'remark-gemoji';

export const markdownOptions = makeSiMarkdownOptions()
  .setCodeHighlighter(siMarkdownHighlightJs())
  .installUnifiedPlugin(remarkGemoji)
  .installExtension(
    // can pass options to KaTeX here. E.g. default rendering is HTML only (speed)
    siMarkdownMathKaTeX(undefined, { output: 'htmlAndMathml' })
  );
