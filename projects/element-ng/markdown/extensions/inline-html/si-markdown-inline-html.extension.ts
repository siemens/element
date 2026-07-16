/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { type SiMarkdownExtension } from '../../si-markdown.types';
import { SiMarkdownInlineHtmlComponent } from './si-markdown-inline-html.component';

/** Extension to render sanitized inline HTML. This is always installed automatically. */
export const siMarkdownInlineHtml = (): SiMarkdownExtension => {
  return {
    types: [{ type: 'html', component: SiMarkdownInlineHtmlComponent }]
  };
};
