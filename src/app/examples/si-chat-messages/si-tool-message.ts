/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { isPlatformBrowser } from '@angular/common';
import { Component, DOCUMENT, inject, PLATFORM_ID } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SiToolMessageComponent } from '@siemens/element-ng/chat-messages';
import { getMarkdownRenderer } from '@siemens/element-ng/markdown-renderer';

@Component({
  selector: 'app-sample',
  imports: [SiToolMessageComponent],
  templateUrl: './si-tool-message.html'
})
export class SampleComponent {
  private sanitizer = inject(DomSanitizer);
  private doc = inject(DOCUMENT);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected markdownRenderer = getMarkdownRenderer(
    this.sanitizer,
    undefined,
    this.doc,
    this.isBrowser
  );

  retrievalInput = {
    query: 'breadcrumb navigation for large datasets',
    sources: ['data-analysis.py', 'dataset.csv']
  };

  retrievalOutput = `Found relevant sources:

- \`data-analysis.py\`
- \`dataset.csv\`
- Performance notes from previous runs`;

  reasoningName = 'Thinking';

  reasoningOutput = `Agent: UI Generator
Model: GPT-X
Duration: 2.3s

**Key findings**

- Breadcrumb is recommended for navigation hierarchy
- Requires items with labels and links
- Placed below the header

**Relevant inputs**

\`page.txs\` \`layout.txs\`

**Plan**

- Add breadcrumb to header
- Use standard component (2-3 levels)
- Align with existing layout`;
}
