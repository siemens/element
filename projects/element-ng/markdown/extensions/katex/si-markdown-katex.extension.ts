/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { type KatexOptions } from 'katex';
import remarkMath, { type Options } from 'remark-math';

import { SiMarkdownExtension } from '../../si-markdown.types';
import { SiMarkdownKatexComponent } from './si-markdown-katex.component';

/**
 * An extension to render LaTeX math expressions using KaTeX. Uses `remark-math` to parse
 * the expressions inside the markdown document.
 * @param parseOptions - options passed to `remark-math`
 * @param katexOptions - options passed to `katex`
 * @returns extension for `SiMarkdownOption.installExtension()`
 */
export const siMarkdownMathKaTeX = (
  parseOptions?: Options,
  katexOptions?: KatexOptions
): SiMarkdownExtension => {
  katexOptions ??= {
    output: 'html'
  };

  return {
    plugins: [{ plugin: remarkMath, options: parseOptions }],
    types: [
      { type: 'math', component: SiMarkdownKatexComponent, options: katexOptions },
      { type: 'inlineMath', component: SiMarkdownKatexComponent, options: katexOptions }
    ]
  };
};
