/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  elementBookmark,
  elementCopy,
  elementGlobal,
  elementRefresh,
  elementShare,
  elementThumbsDown,
  elementThumbsUp
} from '@siemens/element-icons';
import {
  MessageAction,
  SiAiMessageComponent,
  SiChatMessageActionDirective
} from '@siemens/element-ng/chat-messages';
import { SiSource } from '@siemens/element-ng/common';
import { addIcons } from '@siemens/element-ng/icon';
import { getMarkdownRenderer } from '@siemens/element-ng/markdown-renderer';
import { MenuItemAction } from '@siemens/element-ng/menu';
import {
  SiPopoverBodyDirective,
  SiPopoverDirective,
  SiPopoverTitleDirective
} from '@siemens/element-ng/popover';
import { SiSummaryChipComponent } from '@siemens/element-ng/summary-chip';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [
    SiAiMessageComponent,
    SiChatMessageActionDirective,
    SiPopoverBodyDirective,
    SiPopoverDirective,
    SiPopoverTitleDirective,
    SiSummaryChipComponent
  ],
  templateUrl: './si-ai-message.html',
  styleUrl: './si-ai-message.scss'
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
  private sanitizer = inject(DomSanitizer);

  protected markdownRenderer = getMarkdownRenderer(this.sanitizer);

  protected readonly icons = addIcons({
    elementThumbsUp,
    elementThumbsDown,
    elementCopy,
    elementGlobal,
    elementRefresh,
    elementBookmark,
    elementShare
  });

  content = `Here's a **simple response** with basic formatting.

You can use \`inline code\` and create lists:

- First item
- Second item`;

  sources: SiSource[] = [
    {
      name: 'Connected Devices Guide',
      url: 'https://example.com/guides/connected-devices',
      quote: 'Up to 250 devices may be connected to one controller.'
    },
    {
      name: 'System Configuration Manual',
      url: 'https://example.com/manuals/system-configuration',
      description: 'Recommendations for configuring production installations.'
    }
  ];

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

  openSource(source: SiSource): void {
    this.logEvent(`Open source: ${source.name}`);
    window.open(source.url, '_blank', 'noopener');
  }
}
