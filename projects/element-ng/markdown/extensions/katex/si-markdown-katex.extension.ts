/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { type SiMarkdownExtension } from '@siemens/element-ng/markdown';
/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { type KatexOptions } from 'katex';
import remarkMath, { type Options } from 'remark-math';

import { SiMarkdownKatexComponent } from './si-markdown-katex.component';

/**
 * An extension to render LaTeX math expressions using KaTeX. Uses `remark-math` to parse
 * the expressions inside the markdown document.
 * @param parseOptions - options passed to `remark-math`
 * @param katexOptions - options passed to `katex`. Keep the default `trust: false` for untrusted
 * expressions. Do not set `trust: true` unless all expressions rendered with that configuration
 * come from sources you fully trust. For untrusted expressions that require specific commands,
 * use a narrowly scoped `trust` callback that validates commands and their arguments, including URLs.
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
