/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import {
  elementAi,
  elementChecked,
  elementDocument,
  elementEdit,
  elementFunction,
  elementMaintenance,
  elementRecordFilled,
  elementSearch
} from '@siemens/element-icons';
import {
  ActivityMessageState,
  SiActivityMessageComponent
} from '@siemens/element-ng/chat-messages';
import { addIcons } from '@siemens/element-ng/icon';
import { SiMarkdownComponent } from '@siemens/element-ng/markdown';

import { markdownOptions } from './markdown-options';

interface ActivityExample {
  label: string;
  state: ActivityMessageState;
  icon: string;
  content: string;
  expanded?: boolean;
}

@Component({
  selector: 'app-sample',
  imports: [SiActivityMessageComponent, SiMarkdownComponent],
  templateUrl: './si-activity-message.html'
})
export class SampleComponent {
  protected readonly markdownOptions = markdownOptions;
  protected readonly icons = addIcons({
    elementAi,
    elementChecked,
    elementDocument,
    elementEdit,
    elementFunction,
    elementMaintenance,
    elementRecordFilled,
    elementSearch
  });

  protected readonly activities: ActivityExample[] = [
    {
      label: 'Reasoning about the request',
      state: 'running',
      icon: this.icons.elementAi,
      content: 'Analyzing the request and planning the next steps.'
    },
    {
      label: 'Searched the knowledge base',
      state: 'completed',
      icon: this.icons.elementSearch,
      content: 'Found **12 relevant documents** in the product knowledge base.'
    },
    {
      label: 'Calculated energy consumption',
      state: 'completed',
      icon: this.icons.elementFunction,
      content: 'Calculated the projected consumption from the available measurements.'
    },
    {
      label: 'Generated the response',
      state: 'completed',
      icon: this.icons.elementAi,
      content: 'Generated a response using the retrieved documents and computed values.'
    },
    {
      label: 'Edited the configuration',
      state: 'completed',
      icon: this.icons.elementEdit,
      content: 'Applied the requested configuration changes.'
    },
    {
      label: 'Completed the maintenance workflow',
      state: 'completed',
      icon: this.icons.elementMaintenance,
      content: 'All workflow steps completed successfully.'
    },
    {
      label: 'Read equipment-manual.md',
      state: 'completed',
      icon: this.icons.elementDocument,
      content: 'Read the sections about installation and preventive maintenance.'
    },
    {
      label: 'Summarized the findings',
      state: 'completed',
      icon: this.icons.elementChecked,
      content: '- No critical issues found\n- Preventive maintenance is due next month'
    },
    {
      label: 'Could not execute the activity',
      state: 'failed',
      icon: this.icons.elementRecordFilled,
      content: 'The activity failed because the remote service was unavailable.'
    },
    {
      label: 'Generated breadcrumb implementation plan',
      state: 'completed',
      icon: this.icons.elementAi,
      expanded: true,
      content: `Agent: UI Generator  
    Model: GPT-X  
    Duration: 2.3s

\`\`\`tsx
<Breadcrumb
  items={[
    { label: "Home", href: "/" },
    { label: "Dashboard" }
  ]}
/>
\`\`\`

**Key findings**

- Breadcrumb is recommended for navigation hierarchy
- Requires items with labels and links
- Placed below the header

**Relevant inputs**

Here are the two input files to work with.  
[](file:///page.tsx) [](file:///layout.tsx)

**Changes applied**
- Add breadcrumb component to header
- Updated layout structure
- Adjusted spacing tokens`
    }
  ];
}
