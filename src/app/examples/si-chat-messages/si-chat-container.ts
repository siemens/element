/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, inject, signal, TemplateRef, viewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  elementBookmark,
  elementCopy,
  elementDelete,
  elementExport,
  elementGlobal,
  elementRefresh,
  elementShare,
  elementThumbsDown,
  elementThumbsUp,
  elementUser
} from '@siemens/element-icons';
import {
  SiChatContainerComponent,
  SiAiMessageComponent,
  SiUserMessageComponent,
  SiChatInputComponent,
  SiChatMessageComponent,
  ChatInputAttachment,
  MessageAction,
  SiChatMessageActionDirective,
  SiAttachmentListComponent,
  Attachment,
  SiAiWelcomeScreenComponent,
  PromptCategory,
  PromptSuggestion
} from '@siemens/element-ng/chat-messages';
import { SiSource } from '@siemens/element-ng/common';
import { FileUploadError } from '@siemens/element-ng/file-uploader';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiInlineNotificationComponent } from '@siemens/element-ng/inline-notification';
import {
  getMarkdownRenderer,
  SiMarkdownRendererComponent
} from '@siemens/element-ng/markdown-renderer';
import { MenuItem } from '@siemens/element-ng/menu';
import {
  SiPopoverBodyDirective,
  SiPopoverDirective,
  SiPopoverTitleDirective
} from '@siemens/element-ng/popover';
import { SiSummaryChipComponent } from '@siemens/element-ng/summary-chip';
import { SiToastNotificationService } from '@siemens/element-ng/toast-notification';
import { LOG_EVENT } from '@siemens/live-preview';

interface ChatMessage {
  type: 'user' | 'ai' | 'custom';
  content: string;
  attachments?: Attachment[];
  actions?: MessageAction[];
  sources?: SiSource[];
}

@Component({
  selector: 'app-sample',
  imports: [
    SiChatContainerComponent,
    SiAiMessageComponent,
    SiUserMessageComponent,
    SiInlineNotificationComponent,
    SiChatInputComponent,
    SiChatMessageComponent,
    SiIconComponent,
    SiMarkdownRendererComponent,
    SiChatMessageActionDirective,
    SiAttachmentListComponent,
    SiAiWelcomeScreenComponent,
    SiPopoverBodyDirective,
    SiPopoverDirective,
    SiPopoverTitleDirective,
    SiSummaryChipComponent
  ],
  templateUrl: './si-chat-container.html',
  styleUrl: './si-chat-container.scss'
})
export class SampleComponent {
  private logEvent = inject(LOG_EVENT);
  private readonly modalTemplate = viewChild<TemplateRef<any>>('modalTemplate');
  private sanitizer = inject(DomSanitizer);
  private readonly toastService = inject(SiToastNotificationService);
  private readonly chatContainer = viewChild<SiChatContainerComponent>(SiChatContainerComponent);

  protected markdownRenderer = getMarkdownRenderer(this.sanitizer);

  protected readonly icons = addIcons({
    elementUser,
    elementExport,
    elementDelete,
    elementThumbsUp,
    elementThumbsDown,
    elementCopy,
    elementGlobal,
    elementRefresh,
    elementBookmark,
    elementShare
  });

  protected readonly aiActions: MessageAction[] = [
    {
      label: 'Good response',
      icon: this.icons.elementThumbsUp,
      action: (_message: ChatMessage) => this.logEvent('Thumbs up for AI message')
    },
    {
      label: 'Bad response',
      icon: this.icons.elementThumbsDown,
      action: (_message: ChatMessage) => this.logEvent('Thumbs down for AI message')
    },
    {
      label: 'Copy response',
      icon: this.icons.elementCopy,
      action: (_message: ChatMessage) => this.logEvent('Copy AI message')
    },
    {
      label: 'Retry response',
      icon: this.icons.elementRefresh,
      action: (_message: ChatMessage) => this.logEvent('Retry AI message')
    },
    {
      label: 'Bookmark',
      icon: this.icons.elementBookmark,
      action: (_message: ChatMessage) => this.logEvent('Bookmark AI message')
    },
    {
      label: 'Share',
      icon: this.icons.elementShare,
      action: (_message: ChatMessage) => this.logEvent('Share AI message')
    }
  ];

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
          label: 'Export message',
          icon: this.icons.elementExport,
          action: (message: ChatMessage) =>
            this.logEvent(`Export user message ${message.content.slice(0, 20)}...`)
        }
      ]
    },
    {
      type: 'ai',
      content: `I'd be happy to help you analyze your files! I can see you've shared a Python script and a CSV dataset.

  Let me examine the structure and provide guidance.`,
      actions: this.aiActions,
      sources: [
        {
          name: 'Data Analysis Guide',
          url: 'https://example.com/guides/data-analysis',
          quote: 'Start by validating the structure and types of the input data.'
        },
        {
          name: 'Python Performance Manual',
          url: 'https://example.com/manuals/python-performance',
          description: 'Recommendations for processing large datasets efficiently.'
        }
      ]
    },
    {
      type: 'user',
      content:
        'Perfect! What should I focus on first\n\nI also want to make sure the performance is optimized for large datasets since this will be used in production with potentially millions of rows?',
      actions: [
        {
          label: 'Export message',
          icon: this.icons.elementExport,
          action: (_message: ChatMessage) =>
            this.logEvent(`Export user message ${_message.content.slice(0, 20)}...`)
        }
      ]
    },
    {
      type: 'ai',
      content: "Great question! When analyzing large datasets, it's crucial to focus on...",
      actions: this.aiActions,
      sources: [
        {
          name: 'Large Dataset Processing',
          url: 'https://example.com/guides/large-datasets',
          description: 'Techniques for scalable data processing and memory management.'
        }
      ]
    }
  ]);

  readonly loading = signal(false);
  readonly sending = signal(false);
  readonly disabled = signal(false);
  readonly disableInterrupt = signal(false);
  readonly interrupting = signal(false);
  readonly inputValue = signal('');
  readonly firstMessageSent = signal(false);

  inputActions: MessageAction[] = [
    {
      label: 'Clear messages',
      icon: this.icons.elementDelete,
      action: () => this.onClearMessages()
    }
  ];

  userActions: MessageAction[] = [
    {
      label: 'Export message',
      icon: this.icons.elementExport,
      action: (_message: ChatMessage) =>
        this.logEvent(`Export user message ${_message.content.slice(0, 20)}...`)
    },
    {
      label: 'Delete message',
      icon: this.icons.elementDelete,
      action: (_message: ChatMessage) =>
        this.logEvent(`Delete user message ${_message.content.slice(0, 20)}...`)
    }
  ];

  readonly promptCategories: PromptCategory[] = [
    { label: 'All prompts' },
    { label: 'Maintenance' },
    { label: 'Analytics' },
    { label: 'Troubleshooting' }
  ];

  readonly selectedCategory = signal<string | undefined>('All prompts');

  readonly promptSuggestions: Record<string, PromptSuggestion[]> = {
    'All prompts': [
      { text: 'How do I optimize performance for large datasets?' },
      { text: 'What are the best practices for data validation?' },
      { text: 'Help me troubleshoot this error message' },
      { text: 'Explain the difference between async and sync operations' }
    ],
    'Maintenance': [
      { text: 'How do I update system dependencies?' },
      { text: 'What are best practices for database maintenance?' }
    ],
    'Analytics': [
      { text: 'How do I visualize this data?' },
      { text: 'What metrics should I track?' }
    ],
    'Troubleshooting': [
      { text: 'Help me troubleshoot this error message' },
      { text: 'Why is my query running slowly?' }
    ]
  };

  readonly currentPromptSuggestions = computed(() => {
    const category = this.selectedCategory() ?? 'All prompts';
    return this.promptSuggestions[category] || [];
  });

  onPromptSelected(suggestion: PromptSuggestion): void {
    this.logEvent(`Prompt selected: ${suggestion.text}`);
    this.inputValue.set('');
    this.firstMessageSent.set(true);
    this.onMessageSent({ content: suggestion.text, attachments: [] });
  }

  onClearMessages(): void {
    this.logEvent('Clear messages clicked');
    this.messages.set([]);
    setTimeout(() => {
      this.chatContainer()?.scrollToTop();
    });
  }

  onShowWelcomeScreen(): void {
    this.logEvent('Show welcome screen clicked');
    this.messages.set([]);
    setTimeout(() => {
      this.chatContainer()?.scrollToTop();
    });
  }

  onMessageSent(event: { content: string; attachments: ChatInputAttachment[] }): void {
    this.logEvent(`Message sent: "${event.content}" with ${event.attachments.length} attachments`);
    this.firstMessageSent.set(true);
    this.messages.update(current => [
      ...current,
      {
        type: 'user',
        content: event.content,
        actions: [
          {
            label: 'Export message',
            icon: this.icons.elementExport,
            action: () => this.logEvent('Export user message')
          }
        ],
        attachments: event.attachments.map(att => ({
          name: att.name,
          previewTemplate: () => this.modalTemplate()!
        }))
      }
    ]);
    this.simulateAiResponse(event.content);
    this.chatContainer()?.scrollToBottom();
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

  private simulateAiResponse(userInput: string): void {
    this.sending.set(true);

    setTimeout(() => {
      this.sending.set(false);
      this.loading.set(true);

      setTimeout(() => {
        const response = `Thanks for your message: "${userInput}". I can help with that!`;

        this.messages.update(current => [
          ...current,
          {
            type: 'ai',
            content: response,
            actions: this.aiActions,
            sources: [
              {
                name: 'AI Assistant Guide',
                url: 'https://example.com/guides/ai-assistant',
                description: 'General guidance for working with the AI assistant.'
              }
            ]
          }
        ]);
        this.loading.set(false);
      }, 2000);
    }, 1000);
  }

  private readonly messageActionsCache = new WeakMap<
    ChatMessage,
    { primary: MessageAction[]; secondary: MenuItem[] }
  >();

  private getMessageActions(message: ChatMessage): {
    primary: MessageAction[];
    secondary: MenuItem[];
  } {
    const cached = this.messageActionsCache.get(message);
    if (cached) {
      return cached;
    }

    const actions = message.actions ?? [];

    const primary = actions.slice(0, 3);
    const secondary = actions.slice(3).map(
      action =>
        ({
          ...action,
          action: action.action as unknown as (actionParam: any, source: MenuItem) => void,
          type: 'action'
        }) as MenuItem
    );

    const result = { primary, secondary };
    this.messageActionsCache.set(message, result);
    return result;
  }

  protected getMessagePrimaryActions(message: ChatMessage): MessageAction[] {
    return this.getMessageActions(message).primary;
  }

  protected getMessageSecondaryActions(message: ChatMessage): MenuItem[] {
    return this.getMessageActions(message).secondary;
  }

  protected openSource(source: SiSource): void {
    this.logEvent(`Open source: ${source.name}`);
    window.open(source.url, '_blank', 'noopener');
  }
}
