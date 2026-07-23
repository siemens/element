/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { type SiMarkdownExtension } from '../../si-markdown.types';
import { type MarkdownCodeOptions, SiMarkdownCodeComponent } from './si-markdown-code.component';

/** Extension to render code blocks. This is always installed automatically. */
export const siMarkdownCode = (options: MarkdownCodeOptions): SiMarkdownExtension => {
  return {
    types: [{ type: 'code', component: SiMarkdownCodeComponent, options }]
  };
};
