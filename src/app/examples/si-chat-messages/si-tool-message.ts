/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiToolMessageComponent } from '@siemens/element-ng/chat-messages';
import { SiMarkdownComponent } from '@siemens/element-ng/markdown';

import { markdownOptions } from './markdown-options';

@Component({
  selector: 'app-sample',
  imports: [SiToolMessageComponent, SiMarkdownComponent],
  templateUrl: './si-tool-message.html'
})
export class SampleComponent {
  protected markdownOptions = markdownOptions;

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
