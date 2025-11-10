/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, signal, TemplateRef, viewChild, WritableSignal } from '@angular/core';
import {
  AiChatMessage,
  ChatMessage,
  ChatInputAttachment,
  MessageAction,
  SiAiChatContainerComponent,
  SiChatInputComponent,
  UserChatMessage
} from '@siemens/element-ng/chat-messages';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiAiChatContainerComponent, SiChatInputComponent],
  templateUrl: './si-ai-chat-container.html'
})
export class SampleComponent {
  private logEvent = inject(LOG_EVENT);
  private readonly modalTemplate = viewChild<TemplateRef<any>>('modalTemplate');

  readonly preAttachedFiles: ChatInputAttachment[] = [
    {
      name: 'requirements.pdf',
      size: 1234567,
      type: 'application/pdf',
      file: new File([''], 'requirements.pdf', { type: 'application/pdf' })
    },
    {
      name: 'mockup.png',
      size: 654321,
      type: 'image/png',
      file: new File([''], 'mockup.png', { type: 'image/png' })
    }
  ];

  readonly messages = signal<ChatMessage[]>([
    {
      type: 'user',
      content: `Can you help me analyze these files?

I'm having trouble understanding the data structure
and need assistance with the implementation.`,
      attachments: [
        {
          name: 'data-analysis.py',
          previewTemplate: () => this.modalTemplate()!
        },
        {
          name: 'dataset.csv',
          previewTemplate: () => this.modalTemplate()!
        }
      ],
      actions: [
        {
          label: 'Copy message',
          icon: 'element-export',
          action: (message: UserChatMessage) =>
            this.logEvent(`Copy user message ${message.content.slice(0, 20)}...`)
        }
      ]
    },
    {
      type: 'ai',
      content: `I'd be happy to help you analyze your files! I can see you've shared a Python script and a CSV dataset.

Let me examine the structure and provide guidance.`,
      actions: [
        {
          label: 'Good response',
          icon: 'element-plus',
          action: (_message: AiChatMessage) => this.logEvent('Thumbs up for AI message')
        },
        {
          label: 'Copy response',
          icon: 'element-export',
          action: (_message: AiChatMessage) => this.logEvent('Copy AI message')
        },
        {
          label: 'Retry response',
          icon: 'element-refresh',
          action: (_message: AiChatMessage) => this.logEvent('Retry AI message')
        },
        {
          label: 'Bookmark',
          icon: 'element-bookmark',
          action: (_message: AiChatMessage) => this.logEvent('Bookmark AI message')
        }
      ]
    },
    {
      type: 'user',
      content:
        'Perfect! What should I focus on first\n\nI also want to make sure the performance is optimized for large datasets since this will be used in production with potentially millions of rows?',
      actions: [
        {
          label: 'Copy message',
          icon: 'element-export',
          action: (_message: UserChatMessage) =>
            this.logEvent(`Copy user message ${_message.content.slice(0, 20)}...`)
        }
      ]
    },
    {
      type: 'ai',
      content: "Great question! When analyzing large datasets, it's crucial to focus on..."
    }
  ]);

  readonly loading = signal(false);
  readonly sending = signal(false);
  readonly disabled = signal(false);
  readonly disableInterrupt = signal(false);
  readonly interrupting = signal(false);
  readonly inputValue = signal('');

  inputActions: MessageAction[] = [
    {
      label: 'Text formatting',
      icon: 'element-brush',
      action: () => this.logEvent('Text formatting clicked')
    },
    {
      label: 'Message templates',
      icon: 'element-template',
      action: () => this.logEvent('Templates clicked')
    }
  ];

  userActions: MessageAction[] = [
    {
      label: 'Copy message',
      icon: 'element-export',
      action: (_message: UserChatMessage) =>
        this.logEvent(`Copy user message ${_message.content.slice(0, 20)}...`)
    },
    {
      label: 'Delete message',
      icon: 'element-delete',
      action: (_message: UserChatMessage) =>
        this.logEvent(`Delete user message ${_message.content.slice(0, 20)}...`)
    }
  ];

  aiActions: MessageAction[] = [
    {
      label: 'Good response',
      icon: 'element-plus',
      action: (_message: AiChatMessage) => this.logEvent('Thumbs up for AI message')
    },
    {
      label: 'Copy response',
      icon: 'element-export',
      action: (_message: AiChatMessage) => this.logEvent('Copy AI message')
    }
  ];

  onMessageSent(event: { content: string; attachments: ChatInputAttachment[] }): void {
    this.logEvent(`Message sent: "${event.content}" with ${event.attachments.length} attachments`);
    this.addMessage(this.messages, event);
  }

  onInterrupt(): void {
    this.logEvent('Interrupt clicked');
    this.loading.set(false);
    this.interrupting.set(false);
  }

  toggleLoading(): void {
    this.loading.update(current => !current);
  }

  toggleSending(): void {
    this.sending.update(current => !current);
  }

  toggleDisabled(): void {
    this.disabled.update(current => !current);
  }

  toggleDisableInterrupt(): void {
    this.disableInterrupt.update(current => !current);
  }

  toggleInterrupting(): void {
    this.interrupting.update(current => !current);
  }

  private addMessage(
    messagesSignal: WritableSignal<ChatMessage[]>,
    event: { content: string; attachments: ChatInputAttachment[] }
  ): void {
    const userMessage: ChatMessage = {
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
    this.sending.set(true);

    setTimeout(() => {
      this.sending.set(false);
      this.loading.set(true);

      setTimeout(() => {
        const response = `Thanks for your message: "${userInput}". I can help with that!`;

        messagesSignal.update((current: ChatMessage[]) => [
          ...current,
          {
            type: 'ai',
            content: response,
            actions: this.aiActions
          }
        ]);
        this.loading.set(false);
      }, 2000);
    }, 1000);
  }
}
