/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  TemplateRef,
  viewChild
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
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
  Attachment
} from '@siemens/element-ng/chat-messages';
import { FileUploadError } from '@siemens/element-ng/file-uploader';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { SiInlineNotificationComponent } from '@siemens/element-ng/inline-notification';
import {
  getMarkdownRenderer,
  SiMarkdownRendererComponent
} from '@siemens/element-ng/markdown-renderer';
import { MenuItem } from '@siemens/element-ng/menu';
import { SiToastNotificationService } from '@siemens/element-ng/toast-notification';
import { injectSiTranslateService } from '@siemens/element-translate-ng/translate';
import { LOG_EVENT } from '@siemens/live-preview';
import hljs from 'highlight.js';

interface ChatMessage {
  type: 'user' | 'ai' | 'custom';
  content: string;
  attachments?: Attachment[];
  actions?: MessageAction[];
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
    SiAttachmentListComponent
  ],
  templateUrl: './si-chat-container.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  private logEvent = inject(LOG_EVENT);
  private readonly modalTemplate = viewChild<TemplateRef<any>>('modalTemplate');
  private sanitizer = inject(DomSanitizer);
  private readonly toastService = inject(SiToastNotificationService);
  private translate = injectSiTranslateService();

  protected markdownRenderer = getMarkdownRenderer(this.sanitizer, {
    copyCodeButton: 'SI_MARKDOWN_RENDERER.COPY',
    downloadTableButton: 'SI_MARKDOWN_RENDERER.DOWNLOAD',
    translateSync: this.translate.translateSync.bind(this.translate),
    // Optional: Syntax highlighting with highlight.js
    // This function returns highlighted HTML markup for the code content.
    // The returned HTML is sanitized before insertion.
    // Element provides a built-in highlight.js theme that adapts to light/dark mode.
    // Make sure to include highlight.js as a dependency.
    syntaxHighlighter: (code: string, language?: string): string | undefined => {
      if (language && hljs.getLanguage(language)) {
        try {
          return hljs.highlight(code, { language }).value;
        } catch {
          // If highlighting fails, fall back to no highlighting
        }
      }
      return undefined;
    }
  });

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
          icon: 'element-export',
          action: (message: ChatMessage) =>
            this.logEvent(`Export user message ${message.content.slice(0, 20)}...`)
        }
      ]
    },
    {
      type: 'ai',
      content: `I'd be happy to help you analyze your files! I can see you've shared a Python script and a CSV dataset.

  Let me examine the structure and provide guidance.`,
      actions: [
        {
          label: 'Add to list',
          icon: 'element-plus',
          action: (_message: ChatMessage) => this.logEvent('Add AI message to list')
        },
        {
          label: 'Export response',
          icon: 'element-export',
          action: (_message: ChatMessage) => this.logEvent('Export AI message')
        },
        {
          label: 'Retry response',
          icon: 'element-refresh',
          action: (_message: ChatMessage) => this.logEvent('Retry AI message')
        },
        {
          label: 'Bookmark',
          icon: 'element-bookmark',
          action: (_message: ChatMessage) => this.logEvent('Bookmark AI message')
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
          icon: 'element-export',
          action: (_message: ChatMessage) =>
            this.logEvent(`Export user message ${_message.content.slice(0, 20)}...`)
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
      label: 'Format text',
      icon: 'element-brush',
      action: () => this.logEvent('Format text clicked')
    },
    {
      label: 'Use template',
      icon: 'element-template',
      action: () => this.logEvent('Use template clicked')
    }
  ];

  userActions: MessageAction[] = [
    {
      label: 'Export message',
      icon: 'element-export',
      action: (_message: ChatMessage) =>
        this.logEvent(`Export user message ${_message.content.slice(0, 20)}...`)
    },
    {
      label: 'Delete message',
      icon: 'element-delete',
      action: (_message: ChatMessage) =>
        this.logEvent(`Delete user message ${_message.content.slice(0, 20)}...`)
    }
  ];

  aiActions: MessageAction[] = [
    {
      label: 'Add to list',
      icon: 'element-plus',
      action: (_message: ChatMessage) => this.logEvent('Add AI message to list')
    },
    {
      label: 'Export response',
      icon: 'element-export',
      action: (_message: ChatMessage) => this.logEvent('Export AI message')
    }
  ];

  onMessageSent(event: { content: string; attachments: ChatInputAttachment[] }): void {
    this.logEvent(`Message sent: "${event.content}" with ${event.attachments.length} attachments`);
    this.messages.update(current => [
      ...current,
      {
        type: 'user',
        content: event.content,
        actions: [
          {
            label: 'Export message',
            icon: 'element-export',
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
            actions: [
              {
                label: 'Add to list',
                icon: 'element-plus',
                action: () => this.logEvent('Add AI message to list')
              },
              {
                label: 'Export response',
                icon: 'element-export',
                action: () => this.logEvent('Export AI message')
              }
            ]
          }
        ]);
        this.loading.set(false);
      }, 2000);
    }, 1000);
  }

  private getMessageActions(message: ChatMessage): {
    primary: MessageAction[];
    secondary: MenuItem[];
  } {
    const actions = message.actions ?? [];
    let primary: MessageAction[] = [];
    let secondary: MenuItem[] = [];

    const primaryActions = actions.slice(0, 3);
    const secondaryActions = actions.slice(3);

    primary = primaryActions;
    secondary = secondaryActions.map(
      action =>
        ({
          ...action,
          action: action.action as unknown as (actionParam: any, source: MenuItem) => void,
          type: 'action'
        }) as MenuItem
    );

    const result = { primary, secondary };
    return result;
  }

  protected getMessagePrimaryActions(message: ChatMessage): MessageAction[] {
    return this.getMessageActions(message).primary;
  }

  protected getMessageSecondaryActions(message: ChatMessage): MenuItem[] {
    return this.getMessageActions(message).secondary;
  }
}
