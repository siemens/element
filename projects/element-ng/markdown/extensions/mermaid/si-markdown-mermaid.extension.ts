/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { MermaidConfig } from 'mermaid';

import { SiMarkdownExtension } from '../../si-markdown.types';
import { SiMarkdownMermaidComponent } from './si-markdown-mermaid.component';

export const siMarkdownMermaid = (options?: MermaidConfig): SiMarkdownExtension => {
  return {
    codeTypes: [{ type: 'mermaid', component: SiMarkdownMermaidComponent, options }]
  };
};
