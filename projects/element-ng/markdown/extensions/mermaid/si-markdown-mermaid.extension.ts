/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { type SiMarkdownExtension } from '@siemens/element-ng/markdown';
import { MermaidConfig } from 'mermaid';

import { SiMarkdownMermaidComponent } from './si-markdown-mermaid.component';

export const siMarkdownMermaid = (options?: MermaidConfig): SiMarkdownExtension => {
  return {
    codeTypes: [{ type: 'mermaid', component: SiMarkdownMermaidComponent, options }]
  };
};
