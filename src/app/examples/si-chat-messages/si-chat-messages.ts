/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, signal } from '@angular/core';
import {
  SiChatContainerComponent,
  ChatMessage,
  AiChatMessage,
  ChatInputAttachment,
  ActionBarItem
} from '@siemens/element-ng/chat-messages';
import { MenuItemAction } from '@siemens/element-ng/menu';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiChatContainerComponent],
  templateUrl: './si-chat-messages.html'
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);

  // Main chat messages
  readonly messages = signal<ChatMessage[]>([
    {
      id: '1',
      type: 'user',
      content: 'Hello! Can you help me understand how to use the new dashboard feature?',
      timestamp: new Date(Date.now() - 10000),
      actions: [
        {
          type: 'action',
          id: 'edit',
          label: 'Edit message',
          icon: 'element-edit',
          action: (messageId: string) => this.logEvent(`Edit user message ${messageId}`)
        },
        {
          type: 'action',
          id: 'copy',
          label: 'Copy message',
          icon: 'element-export',
          action: (messageId: string) => this.logEvent(`Copy user message ${messageId}`)
        },
        {
          type: 'action',
          id: 'delete',
          label: 'Delete message',
          icon: 'element-delete',
          action: (messageId: string) => this.logEvent(`Delete user message ${messageId}`)
        }
      ]
    },
    {
      id: '2',
      type: 'ai',
      content:
        'I\'d be happy to help you with the dashboard feature! The new dashboard allows you to create custom widgets and arrange them according to your workflow needs.\n\nHere are the key features:\n\n• **Drag & Drop**: Easily rearrange widgets by dragging them\n• **Custom Widgets**: Add your own components\n• **Responsive Layout**: Automatically adapts to screen size\n• **Data Binding**: Connect widgets to live data sources\n\nWould you like me to walk you through any specific aspect?\n\n```\n// Example code snippet for creating a custom widget\nfunction createWidget(name) {\n  return `<div class="widget">${name}</div>`;\n}\n```\n\n> Feel free to ask any questions or request a demo!',
      timestamp: new Date(Date.now() - 5000),
      actions: [
        {
          type: 'action',
          id: 'thumbs-up',
          label: 'Good response',
          icon: 'element-plus',
          action: (messageId: string) => this.logEvent(`Thumbs up for AI message ${messageId}`)
        },
        {
          type: 'action',
          id: 'thumbs-down',
          label: 'Poor response',
          icon: 'element-minus',
          action: (messageId: string) => this.logEvent(`Thumbs down for AI message ${messageId}`)
        },
        {
          type: 'action',
          id: 'copy',
          label: 'Copy response',
          icon: 'element-export',
          action: (messageId: string) => this.logEvent(`Copy AI message ${messageId}`)
        },
        {
          type: 'action',
          id: 'retry',
          label: 'Retry response',
          icon: 'element-refresh',
          action: (messageId: string) => this.logEvent(`Retry AI message ${messageId}`)
        }
      ]
    }
  ]);

  readonly isTyping = signal(false);

  // AI message actions
  aiActions: ActionBarItem[] = [
    {
      type: 'action',
      id: 'thumbs-up',
      label: 'Good response',
      icon: 'element-plus',
      action: (messageId: string) => this.logEvent(`Thumbs up for message ${messageId}`)
    },
    {
      type: 'action',
      id: 'thumbs-down',
      label: 'Poor response',
      icon: 'element-minus',
      action: (messageId: string) => this.logEvent(`Thumbs down for message ${messageId}`)
    },
    {
      type: 'action',
      id: 'copy',
      label: 'Copy response',
      icon: 'element-export',
      action: (messageId: string) => this.logEvent(`Copy message ${messageId}`)
    }
  ];

  // User message actions
  userActions: MenuItemAction[] = [
    {
      type: 'action',
      id: 'edit',
      label: 'Edit message',
      icon: 'element-edit',
      action: (messageId: string) => this.logEvent(`Edit message ${messageId}`)
    },
    {
      type: 'action',
      id: 'copy',
      label: 'Copy message',
      icon: 'element-export',
      action: (messageId: string) => this.logEvent(`Copy message ${messageId}`)
    },
    {
      type: 'action',
      id: 'delete',
      label: 'Delete message',
      icon: 'element-delete',
      action: (messageId: string) => this.logEvent(`Delete message ${messageId}`)
    }
  ];

  // Input actions
  inputActions: ActionBarItem[] = [
    {
      type: 'action',
      id: 'emoji',
      label: 'Add emoji',
      icon: 'element-plus',
      action: () => this.logEvent('Emoji picker clicked')
    },
    {
      type: 'action',
      id: 'formatting',
      label: 'Text formatting',
      icon: 'element-brush',
      action: () => this.logEvent('Text formatting clicked')
    },
    {
      type: 'action',
      id: 'empty',
      label: 'Empty',
      icon: 'element-optionsVertical',
      action: () => this.logEvent('Nothing to do here')
    }
  ];

  // Event handlers
  onMessageSent(event: { content: string; attachments: ChatInputAttachment[] }): void {
    this.logEvent(`Message sent: "${event.content}" with ${event.attachments.length} attachments`);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: event.content,
      timestamp: new Date(),
      attachments: event.attachments.map(att => ({
        id: att.id,
        name: att.name,
        size: att.size,
        type: att.type
      })),
      actions: this.userActions
    };

    this.messages.update(current => [...current, userMessage]);
    this.simulateAiResponse(event.content);
  }

  simulateAiResponse(userInput: string): void {
    this.isTyping.set(true);
    const loadingMessage: AiChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: '',
      timestamp: new Date(),
      loading: true
    };

    this.messages.update(current => [...current, loadingMessage]);

    setTimeout(() => {
      const responses = [
        `Thanks for asking about "${userInput}". Here's what I can tell you...`,
        `That's an interesting question about "${userInput}". Let me explain...`,
        `I see you're curious about "${userInput}". Here's the information you need...`
      ];

      const response = responses[Math.floor(Math.random() * responses.length)];

      this.messages.update(current =>
        current.map(msg =>
          msg.id === loadingMessage.id
            ? ({
                ...msg,
                content: response,
                loading: false,
                actions: this.aiActions
              } as AiChatMessage)
            : msg
        )
      );
      this.isTyping.set(false);
    }, 2000);
  }
}
