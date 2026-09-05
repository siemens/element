/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, inject, signal, TemplateRef, viewChild } from '@angular/core';
import {
  elementAi,
  elementBookmark,
  elementChecked,
  elementCopy,
  elementDelete,
  elementExport,
  elementDocument,
  elementFunction,
  elementGenerate,
  elementRefresh,
  elementSearch,
  elementShare,
  elementSelfLearning,
  elementThumbsDown,
  elementThumbsUp,
  elementUser
} from '@siemens/element-icons';
import {
  SiChatContainerComponent,
  SiActivityMessageComponent,
  SiActivityMessagePartComponent,
  SiActivityTraceComponent,
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
import { FileUploadError } from '@siemens/element-ng/file-uploader';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiInlineNotificationComponent } from '@siemens/element-ng/inline-notification';
import { SiMarkdownComponent } from '@siemens/element-ng/markdown';
import { MenuItem } from '@siemens/element-ng/menu';
import { SiToastNotificationService } from '@siemens/element-ng/toast-notification';
import { LOG_EVENT } from '@siemens/live-preview';

import { markdownOptions } from './markdown-options';

interface ContentMessage {
  type: 'user' | 'ai' | 'custom';
  content: string;
  attachments?: Attachment[];
  actions?: MessageAction[];
}

interface ActivityPart {
  heading: string;
  content: string;
  collapsible?: boolean;
}

interface ActivityMessage {
  type: 'activity';
  heading: string;
  icon?: string;
  state?: 'running' | 'failed';
  content?: string;
  parts?: ActivityPart[];
}

interface ActivityTrace {
  type: 'activity-trace';
  heading: string;
  messages: ActivityMessage[];
}

type ChatMessage = ContentMessage | ActivityMessage | ActivityTrace;

@Component({
  selector: 'app-sample',
  imports: [
    SiChatContainerComponent,
    SiActivityMessageComponent,
    SiActivityMessagePartComponent,
    SiActivityTraceComponent,
    SiAiMessageComponent,
    SiUserMessageComponent,
    SiInlineNotificationComponent,
    SiChatInputComponent,
    SiChatMessageComponent,
    SiIconComponent,
    SiMarkdownComponent,
    SiChatMessageActionDirective,
    SiAttachmentListComponent,
    SiAiWelcomeScreenComponent
  ],
  templateUrl: './si-chat-container.html'
})
export class SampleComponent {
  private logEvent = inject(LOG_EVENT);
  private readonly modalTemplate = viewChild<TemplateRef<any>>('modalTemplate');
  private readonly toastService = inject(SiToastNotificationService);
  private readonly chatContainer = viewChild<SiChatContainerComponent>(SiChatContainerComponent);

  protected markdownOptions = markdownOptions;

  protected readonly icons = addIcons({
    elementAi,
    elementUser,
    elementExport,
    elementChecked,
    elementDocument,
    elementFunction,
    elementGenerate,
    elementSearch,
    elementSelfLearning,
    elementDelete,
    elementThumbsUp,
    elementThumbsDown,
    elementCopy,
    elementRefresh,
    elementBookmark,
    elementShare
  });

  protected readonly aiActions: MessageAction[] = [
    {
      label: 'Good response',
      icon: this.icons.elementThumbsUp,
      action: (_message: ContentMessage) => this.logEvent('Thumbs up for AI message')
    },
    {
      label: 'Bad response',
      icon: this.icons.elementThumbsDown,
      action: (_message: ContentMessage) => this.logEvent('Thumbs down for AI message')
    },
    {
      label: 'Copy response',
      icon: this.icons.elementCopy,
      action: (_message: ContentMessage) => this.logEvent('Copy AI message')
    },
    {
      label: 'Retry response',
      icon: this.icons.elementRefresh,
      action: (_message: ContentMessage) => this.logEvent('Retry AI message')
    },
    {
      label: 'Bookmark',
      icon: this.icons.elementBookmark,
      action: (_message: ContentMessage) => this.logEvent('Bookmark AI message')
    },
    {
      label: 'Share',
      icon: this.icons.elementShare,
      action: (_message: ContentMessage) => this.logEvent('Share AI message')
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
          action: (message: ContentMessage) =>
            this.logEvent(`Export user message ${message.content.slice(0, 20)}...`)
        }
      ]
    },
    {
      type: 'ai',
      content: 'I will inspect the files, compare their structures, and summarize the findings.',
      actions: this.aiActions
    },
    {
      type: 'activity-trace',
      heading: 'Analyzing the attached files',
      messages: [
        {
          type: 'activity',
          heading: 'Searching documentation',
          icon: this.icons.elementSearch,
          parts: [
            {
              heading: 'Input',
              content: 'Python processing logic and CSV column definitions'
            },
            {
              heading: 'Output',
              content: 'Mapped each transformation to its corresponding dataset columns.'
            }
          ]
        },
        {
          type: 'activity',
          heading: 'Reading relevant files',
          icon: this.icons.elementDocument,
          content: 'Loaded `data-analysis.py` and `dataset.csv`.'
        },
        {
          type: 'activity',
          heading: 'Computing KPI values',
          icon: this.icons.elementFunction,
          content: 'Calculated the requested performance indicators.'
        },
        {
          type: 'activity',
          heading: 'Generating dashboard',
          icon: this.icons.elementGenerate,
          content: 'Created the dashboard layout and KPI cards.'
        },
        {
          type: 'activity',
          heading: 'Dashboard ready',
          icon: this.icons.elementChecked,
          content: 'Validated the generated dashboard.'
        }
      ]
    },
    {
      type: 'ai',
      content:
        'The script and dataset use compatible structures. The data-loading step is the main performance constraint.',
      actions: this.aiActions
    },
    {
      type: 'user',
      content:
        'Perfect! What should I focus on first\n\nI also want to make sure the performance is optimized for large datasets since this will be used in production with potentially millions of rows?',
      actions: [
        {
          label: 'Export message',
          icon: this.icons.elementExport,
          action: (_message: ContentMessage) =>
            this.logEvent(`Export user message ${_message.content.slice(0, 20)}...`)
        }
      ]
    },
    {
      type: 'activity',
      heading: 'Reviewing performance constraints',
      icon: this.icons.elementSelfLearning,
      content: 'Checking memory usage and processing behavior for large datasets.'
    },
    {
      type: 'activity',
      heading: 'Preparing optimization guidance',
      icon: this.icons.elementSelfLearning,
      content: 'Prioritizing changes that reduce memory usage without changing the data structure.'
    },
    {
      type: 'ai',
      content: 'Process the CSV in chunks first, then profile the transformation steps.',
      actions: this.aiActions
    }
  ]);

  readonly loading = signal(false);
  readonly sending = signal(false);
  readonly followUpPrompts = signal<string[]>([
    'What are the risks if this insight is ignored?',
    'Show related insights from similar customer events.',
    'Summarize this insight in 2 bullet points for presentation.'
  ]);
  readonly disabled = signal(false);
  readonly disableInterrupt = signal(false);
  readonly interrupting = signal(false);
  readonly inputValue = signal('');
  readonly firstMessageSent = signal(false);

  protected isLatestActivityMessage(message: ActivityMessage | ActivityTrace): boolean {
    const messages = this.messages();
    const messageIndex = messages.indexOf(message);

    return !messages
      .slice(messageIndex + 1)
      .some(next => ['activity', 'activity-trace', 'user'].includes(next.type));
  }

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
      action: (_message: ContentMessage) =>
        this.logEvent(`Export user message ${_message.content.slice(0, 20)}...`)
    },
    {
      label: 'Delete message',
      icon: this.icons.elementDelete,
      action: (_message: ContentMessage) =>
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

  onFollowUpPromptSelected(prompt: string): void {
    this.inputValue.set(prompt);
    this.followUpPrompts.set([]);
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
    this.followUpPrompts.set([]);
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
    this.toastService.queueToastNotification(
      'danger',
      error.errorText,
      error.fileName,
      undefined,
      undefined,
      undefined,
      error.errorParams
    );
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
            actions: this.aiActions
          }
        ]);
        this.followUpPrompts.set([
          'What are the risks if this insight is ignored?',
          'Show related insights from similar customer events.',
          'Summarize this insight in 2 bullet points for presentation.',
          'Generate a summary report'
        ]);
        this.loading.set(false);
      }, 2000);
    }, 1000);
  }

  private readonly messageActionsCache = new WeakMap<
    ContentMessage,
    { primary: MessageAction[]; secondary: MenuItem[] }
  >();

  private getMessageActions(message: ContentMessage): {
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

  protected getMessagePrimaryActions(message: ContentMessage): MessageAction[] {
    return this.getMessageActions(message).primary;
  }

  protected getMessageSecondaryActions(message: ContentMessage): MenuItem[] {
    return this.getMessageActions(message).secondary;
  }
}
