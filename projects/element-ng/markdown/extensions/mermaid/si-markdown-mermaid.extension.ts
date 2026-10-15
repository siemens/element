/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { type SiMarkdownExtension } from '@siemens/element-ng/markdown';
import { MermaidConfig } from 'mermaid';

import { SiMarkdownMermaidComponent } from './si-markdown-mermaid.component';

/**
 * An extension to render Mermaid diagrams.
 *
 * Options configure the shared Mermaid instance and are not isolated per Markdown component.
 * Keep `securityLevel: 'strict'` for untrusted content and avoid mixing strict and permissive
 * configurations. The integration trusts Mermaid's generated SVG output.
 *
 * @param options - trusted application configuration passed to Mermaid
 */
export const siMarkdownMermaid = (options?: MermaidConfig): SiMarkdownExtension => {
  return {
    codeTypes: [{ type: 'mermaid', component: SiMarkdownMermaidComponent, options }]
  };
};
