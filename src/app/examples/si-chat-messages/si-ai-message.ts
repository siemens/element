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
import { SiMarkdownComponent } from '@siemens/element-ng/markdown';
import { SiMarkdownCitation } from '@siemens/element-ng/markdown/extensions/source-citations';
import { MenuItemAction } from '@siemens/element-ng/menu';
import { LOG_EVENT } from '@siemens/live-preview';

import { createChatMarkdownOptions } from '../../shared/chat-markdown-options';

@Component({
  selector: 'app-sample',
  imports: [SiAiMessageComponent, SiMarkdownComponent],
  templateUrl: './si-ai-message.html'
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);

  protected readonly citations: SiMarkdownCitation[] = [
    {
      reference: '1',
      name: 'Connected Devices Guide',
      url: 'https://example.com/guides/connected-devices',
      quote: 'Up to 250 devices may be connected to one controller.'
    },
    {
      reference: '2',
      name: 'System Configuration Manual',
      url: 'https://example.com/manuals/system-configuration',
      description: 'Recommendations for configuring production installations.'
    }
  ];

  protected readonly markdownOptions = createChatMarkdownOptions({
    citations: this.citations,
    onSourceOpen: citation => this.openSource(citation)
  });

  protected readonly icons = addIcons({
    elementThumbsUp,
    elementThumbsDown,
    elementCopy,
    elementRefresh,
    elementBookmark,
    elementShare
  });

  content = `Here's a **simple response** with basic formatting and source citations.[1]

You can use \`inline code\` and create lists:

- First item
- Second item

Production installations should follow the device and configuration guidance.[1][2]`;

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

  private openSource(citation: SiMarkdownCitation): void {
    this.logEvent(`Open source: ${citation.name}`);
    window.open(citation.url, '_blank', 'noopener');
  }
}
