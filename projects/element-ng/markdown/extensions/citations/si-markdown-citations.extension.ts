/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { SiMarkdownMetadata, type SiMarkdownExtension } from '@siemens/element-ng/markdown';

import { siMarkdownCitationsTransformer } from './si-markdown-citations';
import { SiMarkdownCitationsComponent } from './si-markdown-citations.component';

/** Extension to parse and render source citations. */
export const siMarkdownCitations = (): SiMarkdownExtension => {
  return {
    plugins: [
      {
        plugin: siMarkdownCitationsTransformer,
        options: (meta: SiMarkdownMetadata) => meta.citations
      }
    ],
    types: [{ type: 'citations', component: SiMarkdownCitationsComponent }]
  };
};
