/**
 * Copyright (c) Siemens 2016 - 2026
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
  UserChatMessage,
  PromptSuggestion
} from '@siemens/element-ng/chat-messages';
import { FileUploadError } from '@siemens/element-ng/file-uploader';
import { SiToastNotificationService } from '@siemens/element-ng/toast-notification';
import { LOG_EVENT } from '@siemens/live-preview';

import { markdownOptions } from './markdown-options';

@Component({
  selector: 'app-sample',
  imports: [SiAiChatContainerComponent, SiChatInputComponent],
  templateUrl: './si-ai-chat-container.html'
})
export class SampleComponent {
  private logEvent = inject(LOG_EVENT);
  private readonly modalTemplate = viewChild<TemplateRef<any>>('modalTemplate');
  private readonly toastService = inject(SiToastNotificationService);
  protected readonly markdownOptions = markdownOptions;

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
      content: `I can analyze the Python script and CSV dataset.

I will inspect how the files are loaded and transformed.`,
      actions: this.aiActions
    },
    {
      type: 'activity-trace',
      name: 'Analyzing the attached files',
      autoExpand: true,
      messages: [
        {
          type: 'activity',
          name: 'Searching documentation',
          icon: 'element-search',
          content: 'Found the relevant dashboard and KPI guidance.'
        },
        {
          type: 'activity',
          name: 'Reading relevant files',
          icon: 'element-document',
          content: 'Loaded `data-analysis.py` and `dataset.csv`.'
        },
        {
          type: 'activity',
          name: 'Computing KPI values',
          icon: 'element-function',
          content: 'Calculated the requested performance indicators.'
        },
        {
          type: 'activity',
          name: 'Generating dashboard',
          icon: 'element-generate',
          content: 'Created the dashboard layout and KPI cards.'
        },
        {
          type: 'activity',
          name: 'Dashboard ready',
          icon: 'element-checked',
          content: 'Validated the generated dashboard.'
        }
      ]
    },
    {
      type: 'ai',
      content:
        'The files use compatible structures. The eager data-loading step is the main performance constraint.',
      actions: this.aiActions
    },
    {
      type: 'user',
      content: 'What should I optimize first if the dataset can contain several million rows?',
      actions: this.userActions
    },
    {
      type: 'activity',
      name: 'Reasoning',
      icon: 'element-self-learning',
      content: 'The data is loaded eagerly, so chunked processing should be the first improvement.'
    },
    {
      type: 'activity',
      name: 'Computing performance impact',
      icon: 'element-function',
      input: {
        Files: 'data-analysis.py, dataset.csv',
        Focus: 'performance'
      },
      output: 'Chunked processing reduces peak memory usage.',
      autoExpand: true,
      autoExpandInputs: ['Focus'],
      autoExpandOutputs: false
    },
    {
      type: 'ai',
      content: 'Process the CSV in chunks first, then profile the transformation steps.',
      actions: this.aiActions
    }
  ]);

  readonly loading = signal(false);
  readonly sending = signal(false);
  readonly disabled = signal(false);
  readonly disableInterrupt = signal(false);
  readonly interrupting = signal(false);
  readonly inputValue = signal('');

  readonly promptSuggestionsByCategory: Record<string, PromptSuggestion[]> = {
    Maintenance: [
      { text: 'Schedule preventive maintenance tasks' },
      { text: 'Generate maintenance reports' },
      { text: 'Track equipment downtime' }
    ],
    Analytics: [
      { text: 'Analyze performance metrics' },
      { text: 'Generate data visualizations' },
      { text: 'Create predictive models' }
    ],
    Troubleshooting: [
      { text: 'Debug connection issues' },
      { text: 'Investigate performance bottlenecks' },
      { text: 'Resolve configuration errors' }
    ]
  };

  inputActions: MessageAction[] = [
    {
      label: 'Clear messages',
      icon: 'element-delete',
      action: () => this.onClearMessages()
    }
  ];

  onClearMessages(): void {
    this.logEvent('Clear messages clicked');
    this.messages.set([]);
  }

  onMessageSent(event: { content: string; attachments: ChatInputAttachment[] }): void {
    this.logEvent(`Message sent: "${event.content}" with ${event.attachments.length} attachments`);
    this.addMessage(this.messages, event);
  }

  onInterrupt(): void {
    this.logEvent('Interrupt clicked');
    this.loading.set(false);
    this.interrupting.set(false);
  }

  onFileError(error: FileUploadError): void {
    this.logEvent(`File error: ${error.errorText} - ${error.fileName}`);
    this.toastService.queueToastNotification('danger', error.errorText, error.fileName);
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
