/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import {
  elementBookmark,
  elementCopy,
  elementRefresh,
  elementShare,
  elementThumbsDown,
  elementThumbsUp
} from '@siemens/element-icons';
import { MessageAction, SiAiMessageComponent } from '@siemens/element-ng/chat-messages';
import { addIcons } from '@siemens/element-ng/icon';
import { SiMarkdownCitation, SiMarkdownComponent } from '@siemens/element-ng/markdown';
import { MenuItemAction } from '@siemens/element-ng/menu';
import { SourceReference } from '@siemens/element-ng/source-chip';
import { LOG_EVENT } from '@siemens/live-preview';

import { markdownOptions } from './markdown-options';

@Component({
  selector: 'app-sample',
  imports: [SiAiMessageComponent, SiMarkdownComponent],
  templateUrl: './si-ai-message.html'
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);

  protected markdownOptions = markdownOptions;

  protected readonly icons = addIcons({
    elementThumbsUp,
    elementThumbsDown,
    elementCopy,
    elementRefresh,
    elementBookmark,
    elementShare
  });

  content = `Here's a **simple response** with basic formatting.

You can use \`inline code\` and create lists:

- First item [1]
- Second item [2]
- **Bold text** for emphasis
- _Italic text_ for subtle emphasis
`;

  actions: MessageAction[] = [
    {
      label: 'Good response',
      icon: this.icons.elementThumbsUp,
      action: (messageId: string) => this.logEvent(`Thumbs up for message ${messageId}`)
    },
    {
      label: 'Bad response',
      icon: this.icons.elementThumbsDown,
      action: (messageId: string) => this.logEvent(`Thumbs down for message ${messageId}`)
    },
    {
      label: 'Copy response',
      icon: this.icons.elementCopy,
      action: (messageId: string) => this.logEvent(`Copy message ${messageId}`)
    }
  ];

  secondaryActions: MenuItemAction[] = [
    {
      type: 'action',
      label: 'Retry response',
      icon: this.icons.elementRefresh,
      action: (messageId: string) => this.logEvent(`Retry message ${messageId}`)
    },
    {
      type: 'action',
      label: 'Bookmark',
      icon: this.icons.elementBookmark,
      action: (messageId: string) => this.logEvent(`Bookmark message ${messageId}`)
    },
    {
      type: 'action',
      label: 'Share',
      icon: this.icons.elementShare,
      action: (messageId: string) => this.logEvent(`Share message ${messageId}`)
    }
  ];

  sources: SourceReference[] = [
    {
      name: 'Data Analysis Guide',
      url: 'https://example.com/guides/data-analysis',
      quote: 'Start by reviewing the dataset structure and validating the input data.'
    },
    {
      name: 'Large Dataset Performance Guide',
      url: 'https://example.com/guides/large-datasets',
      description: 'Recommendations for processing production datasets with millions of rows.'
    }
  ];

  inlineSources: SiMarkdownCitation[] = [
    {
      identifier: '1',
      name: 'First source',
      url: 'https://example.com/guides/data-analysis',
      quote: 'Start by reviewing the dataset structure and validating the input data.'
    },
    {
      identifier: '2',
      name: 'Second source',
      url: 'https://example.com/guides/large-datasets',
      description: 'Recommendations for processing production datasets with millions of rows.'
    }
  ];
}
