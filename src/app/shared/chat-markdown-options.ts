/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { makeSiMarkdownOptions, SiMarkdownOptions } from '@siemens/element-ng/markdown';
import { siMarkdownMathKaTeX } from '@siemens/element-ng/markdown/extensions/katex';
import {
  siMarkdownSourceCitations,
  type SiMarkdownSourceCitationsOptions
} from '@siemens/element-ng/markdown/extensions/source-citations';
import { siMarkdownHighlightJs } from '@siemens/element-ng/markdown/hightlighter/highlightjs';
import remarkGemoji from 'remark-gemoji';

export const createChatMarkdownOptions = (
  sourceCitations?: SiMarkdownSourceCitationsOptions
): SiMarkdownOptions => {
  const options = makeSiMarkdownOptions()
    .setCodeHighlighter(siMarkdownHighlightJs())
    .installUnifiedPlugin(remarkGemoji)
    .installExtension(
      // can pass options to KaTeX here. E.g. default rendering is HTML only (speed)
      siMarkdownMathKaTeX(undefined, { output: 'htmlAndMathml' })
    );

  if (sourceCitations) {
    options.installExtension(siMarkdownSourceCitations(sourceCitations));
  }

  return options;
};

export const chatMarkdownOptions = createChatMarkdownOptions();