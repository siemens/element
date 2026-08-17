/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { type SiMarkdownExtension } from '../../si-markdown.types';
import { SiMarkdownLinkComponent } from './si-markdown-link.component';

/** Extension to render markdown links. This is always installed automatically. */
export const siMarkdownLink = (): SiMarkdownExtension => {
  return {
    types: [{ type: 'link', component: SiMarkdownLinkComponent }]
  };
};
