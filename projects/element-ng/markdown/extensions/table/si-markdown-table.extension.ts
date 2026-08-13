/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { type SiMarkdownExtension } from '../../si-markdown.types';
import { SiMarkdownTableComponent } from './si-markdown-table.component';

/** Extension to render markdown tables. This is always installed automatically. */
export const siMarkdownTable = (): SiMarkdownExtension => {
  return {
    types: [{ type: 'table', component: SiMarkdownTableComponent }]
  };
};
