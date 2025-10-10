/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, signal, TemplateRef, viewChild, WritableSignal } from '@angular/core';
import {
  SiChatContainerComponent,
  ChatMessage,
  ChatInputAttachment,
  ActionBarItem
} from '@siemens/element-ng/chat-messages';
import { MenuItemAction } from '@siemens/element-ng/menu';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiChatContainerComponent],
  templateUrl: './si-chat-container.html'
})
export class SampleComponent {
  private logEvent = inject(LOG_EVENT);
  private readonly modalTemplate = viewChild<TemplateRef<any>>('modalTemplate');

  readonly preAttachedFiles: ChatInputAttachment[] = [
    {
      id: 'pre1',
      name: 'requirements.pdf',
      size: 1234567,
      type: 'application/pdf',
      file: new File([''], 'requirements.pdf', { type: 'application/pdf' })
    },
    {
      id: 'pre2',
      name: 'mockup.png',
      size: 654321,
      type: 'image/png',
      file: new File([''], 'mockup.png', { type: 'image/png' })
    }
  ];

  readonly messages = signal<ChatMessage[]>([
    {
      id: '1',
      type: 'user',
      content: `Can you help me analyze these files?

I'm having trouble understanding the data structure
and need assistance with the implementation.`,
      attachments: [
        {
          id: 'file1',
          name: 'data-analysis.py',
          previewTemplate: () => this.modalTemplate()!
        },
        {
          id: 'file2',
          name: 'dataset.csv',
          previewTemplate: () => this.modalTemplate()!
        }
      ],
      actions: [
        {
          type: 'action',
          id: 'copy',
          label: 'Copy message',
          icon: 'element-export',
          action: (messageId: string) => this.logEvent(`Copy user message ${messageId}`)
        }
      ]
    },
    {
      id: '2',
      type: 'ai',
      content: `I'd be happy to help you analyze your files! I can see you've shared a Python script and a CSV dataset.

Let me examine the structure and provide guidance.`,
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
        },
        {
          type: 'action',
          id: 'bookmark',
          label: 'Bookmark',
          icon: 'element-bookmark',
          action: (messageId: string) => this.logEvent(`Bookmark AI message ${messageId}`)
        }
      ]
    },
    {
      id: '3',
      type: 'user',
      content:
        'Perfect! What should I focus on first\n\nI also want to make sure the performance is optimized for large datasets since this will be used in production with potentially millions of rows.?',
      actions: [
        {
          type: 'action',
          id: 'copy',
          label: 'Copy message',
          icon: 'element-export',
          action: (messageId: string) => this.logEvent(`Copy user message ${messageId}`)
        }
      ]
    },
    {
      id: '4',
      type: 'ai',
      content: "Great question! When analyzing large datasets, it's crucial to focus on..."
    }
  ]);

  readonly loading = signal(false);

  inputActions: ActionBarItem[] = [
    {
      type: 'action',
      id: 'formatting',
      label: 'Text formatting',
      icon: 'element-brush',
      action: () => this.logEvent('Text formatting clicked')
    },
    {
      type: 'action',
      id: 'templates',
      label: 'Message templates',
      icon: 'element-template',
      action: () => this.logEvent('Templates clicked')
    }
  ];

  userActions: MenuItemAction[] = [
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
      id: 'copy',
      label: 'Copy response',
      icon: 'element-export',
      action: (messageId: string) => this.logEvent(`Copy message ${messageId}`)
    }
  ];

  onMessageSent(event: { content: string; attachments: ChatInputAttachment[] }): void {
    this.logEvent(`Message sent: "${event.content}" with ${event.attachments.length} attachments`);
    this.addMessage(this.messages, event);
  }

  private addMessage(
    messagesSignal: WritableSignal<ChatMessage[]>,
    event: { content: string; attachments: ChatInputAttachment[] }
  ): void {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: event.content,
      attachments: event.attachments.map(att => ({
        ...att,
        previewTemplate: this.modalTemplate()
      })),
      actions: this.userActions
    };

    messagesSignal.update((current: ChatMessage[]) => [...current, userMessage]);
    this.simulateAiResponse(event.content, event.attachments, messagesSignal);
  }

  simulateAiResponse(
    userInput: string,
    attachments: ChatInputAttachment[],
    messagesSignal: any
  ): void {
    this.loading.set(true);

    setTimeout(() => {
      const response = `Thanks for your message: "${userInput}". I can help with that!`;

      messagesSignal.update((current: ChatMessage[]) => [
        ...current,
        {
          id: Date.now().toString(),
          type: 'ai',
          content: response,
          actions: this.aiActions
        }
      ]);
      this.loading.set(false);
    }, 1500);
  }
}
