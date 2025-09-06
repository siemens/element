/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, signal } from '@angular/core';
import {
  SiChatContainerComponent,
  ChatMessage,
  ChatInputAction,
  ChatInputAttachment,
  AiMessageAction,
  UserMessageAction
} from '@siemens/element-ng/chat-messages';
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
          id: 'edit',
          label: 'Edit message',
          icon: 'element-edit',
          action: messageId => this.logEvent(`Edit user message ${messageId}`)
        },
        {
          id: 'copy',
          label: 'Copy message',
          icon: 'element-export',
          action: messageId => this.logEvent(`Copy user message ${messageId}`)
        },
        {
          id: 'delete',
          label: 'Delete message',
          icon: 'element-delete',
          action: messageId => this.logEvent(`Delete user message ${messageId}`)
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
          id: 'thumbs-up',
          label: 'Good response',
          icon: 'element-plus',
          action: messageId => this.logEvent(`Thumbs up for AI message ${messageId}`)
        },
        {
          id: 'thumbs-down',
          label: 'Poor response',
          icon: 'element-minus',
          action: messageId => this.logEvent(`Thumbs down for AI message ${messageId}`)
        },
        {
          id: 'copy',
          label: 'Copy response',
          icon: 'element-export',
          action: messageId => this.logEvent(`Copy AI message ${messageId}`)
        },
        {
          id: 'retry',
          label: 'Retry response',
          icon: 'element-refresh',
          action: messageId => this.logEvent(`Retry AI message ${messageId}`)
        }
      ]
    }
  ]);

  readonly isTyping = signal(false);

  // AI message actions
  aiActions: AiMessageAction[] = [
    {
      id: 'thumbs-up',
      label: 'Good response',
      icon: 'element-plus',
      action: messageId => this.logEvent(`Thumbs up for message ${messageId}`)
    },
    {
      id: 'thumbs-down',
      label: 'Poor response',
      icon: 'element-minus',
      action: messageId => this.logEvent(`Thumbs down for message ${messageId}`)
    },
    {
      id: 'copy',
      label: 'Copy response',
      icon: 'element-export',
      action: messageId => this.logEvent(`Copy message ${messageId}`)
    }
  ];

  // User message actions
  userActions: UserMessageAction[] = [
    {
      id: 'edit',
      label: 'Edit message',
      icon: 'element-edit',
      action: messageId => this.logEvent(`Edit message ${messageId}`)
    },
    {
      id: 'copy',
      label: 'Copy message',
      icon: 'element-export',
      action: messageId => this.logEvent(`Copy message ${messageId}`)
    },
    {
      id: 'delete',
      label: 'Delete message',
      icon: 'element-delete',
      action: messageId => this.logEvent(`Delete message ${messageId}`)
    }
  ];

  // Input actions
  inputActions: ChatInputAction[] = [
    {
      id: 'emoji',
      label: 'Add emoji',
      icon: 'element-plus',
      action: () => this.logEvent('Emoji picker clicked')
    },
    {
      id: 'formatting',
      label: 'Text formatting',
      icon: 'element-brush',
      action: () => this.logEvent('Text formatting clicked')
    },
    {
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
        type: att.type,
        previewUrl: att.previewUrl
      })),
      actions: this.userActions
    };

    this.messages.update(current => [...current, userMessage]);
    this.simulateAiResponse(event.content);
  }

  onMessageAction(event: { messageId: string; actionId: string; message: ChatMessage }): void {
    this.logEvent(`Action "${event.actionId}" triggered for message ${event.messageId}`);
  }

  onAttachmentClick(event: { messageId: string; attachment: any }): void {
    this.logEvent(`Attachment "${event.attachment.name}" clicked in message ${event.messageId}`);
  }

  simulateAiResponse(userInput: string): void {
    this.isTyping.set(true);

    const loadingMessage: ChatMessage = {
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
            ? { ...msg, content: response, loading: false, actions: this.aiActions }
            : msg
        )
      );

      this.isTyping.set(false);
    }, 2000);
  }
}
