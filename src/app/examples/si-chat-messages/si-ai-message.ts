/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  elementBookmark,
  elementCopy,
  elementRefresh,
  elementShare,
  elementThumbsDown,
  elementThumbsUp
} from '@siemens/element-icons';
import {
  MessageAction,
  SiAiMessageComponent,
  SiChatAnnotatedText,
  SiChatCitation
} from '@siemens/element-ng/chat-messages';
import { addIcons } from '@siemens/element-ng/icon';
import { getMarkdownRenderer } from '@siemens/element-ng/markdown-renderer';
import { MenuItemAction } from '@siemens/element-ng/menu';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiAiMessageComponent],
  templateUrl: './si-ai-message.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
  private sanitizer = inject(DomSanitizer);

  protected markdownRenderer = getMarkdownRenderer(this.sanitizer);

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

- First item
- Second item`;

  annotatedText: SiChatAnnotatedText = {
    segments: [
      {
        type: 'text',
        content:
          'Neural networks are composed of layers of interconnected nodes that process information in parallel, enabling the model to learn complex patterns from large datasets.'
      },
      { type: 'citation', citationId: '1' },
      {
        type: 'text',
        content:
          ' The training process adjusts the weights of these connections to minimize prediction error using backpropagation.'
      },
      { type: 'citation', citationId: '2' }
    ],
    citations: [
      {
        id: '1',
        title: 'Deep Learning – Ian Goodfellow et al.',
        url: 'https://examples.org/deeplearningbook',
        description:
          'Neural networks are universal function approximators composed of alternating linear transformations and non-linear activations, trained end-to-end via gradient descent.'
      },
      {
        id: '2',
        title: 'Backpropagation Algorithm – Stanford CS231n',
        url: 'https://examples.org/cs231n',
        description:
          'Backpropagation computes the gradient of the loss with respect to each weight by applying the chain rule recursively from the output layer to the input layer.'
      }
    ]
  };

  onCitationClicked(citation: SiChatCitation): void {
    alert(`Source: ${citation.title}${citation.url ? `\n${citation.url}` : ''}`);
  }

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
}
