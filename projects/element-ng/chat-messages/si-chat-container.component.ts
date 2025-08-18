/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  input,
  output,
  TemplateRef,
  ViewChild,
  ElementRef,
  effect
} from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { SiResponsiveContainerDirective } from '@siemens/element-ng/resize-observer';
import { SiTranslatePipe, t, TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiAiMessageComponent, AiMessageAction } from './si-ai-message.component';
import {
  SiChatInputComponent,
  ChatInputAction,
  ChatInputAttachment
} from './si-chat-input.component';
import {
  SiUserMessageComponent,
  UserMessageAction,
  UserMessageAttachment
} from './si-user-message.component';

export interface ChatMessage {
  /** Unique identifier for the message */
  id: string;
  /** Type of message */
  type: 'user' | 'ai';
  /** Message content */
  content: string;
  /** Timestamp when message was created */
  timestamp: Date;
  /** Whether the message is currently loading/being generated */
  loading?: boolean;
  /** Actions available for this message */
  actions?: UserMessageAction[] | AiMessageAction[];
  /** Attachments (for user messages) */
  attachments?: UserMessageAttachment[];
  /** Additional CSS classes */
  messageClass?: string;
}

@Component({
  selector: 'si-chat-container',
  imports: [
    NgTemplateOutlet,
    SiIconComponent,
    SiAiMessageComponent,
    SiUserMessageComponent,
    SiChatInputComponent,
    SiResponsiveContainerDirective,
    SiTranslatePipe
  ],
  templateUrl: './si-chat-container.component.html',
  styleUrl: './si-chat-container.component.scss',
  host: {
    class: 'si-chat-container',
    '[class.si-chat-container--empty]': 'isEmpty()',
    '[class.si-chat-container--loading]': 'isLoading()'
  }
})
export class SiChatContainerComponent {
  @ViewChild('messagesContainer', { static: false })
  private messagesContainer?: ElementRef<HTMLElement>;

  private isUserAtBottom = true;
  private lastMessageCount = 0;

  /**
   * List of chat messages to display
   * @defaultValue []
   */
  readonly messages = input<ChatMessage[]>([]);

  /**
   * Whether the chat input is disabled
   * @defaultValue false
   */
  readonly disabled = input(false);

  /**
   * Whether a message is currently being sent/processed
   * @defaultValue false
   */
  readonly sending = input(false);

  /**
   * Placeholder text for the chat input
   * @defaultValue 'Type a message...'
   */
  readonly inputPlaceholder = input<TranslatableString>('Type a message...');

  /**
   * AI disclaimer text, set to undefined to disable.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_INPUT.AI_DISCLAIMER:AI can make mistakes. Verify important information.`)
   * ```
   */
  readonly disclaimer = input<TranslatableString | undefined>(
    t(
      () =>
        $localize`:@@SI_CHAT_INPUT.AI_DISCLAIMER:AI can make mistakes. Verify important information.`
    )
  );

  /**
   * Actions available in the chat input
   * @defaultValue []
   */
  readonly inputActions = input<ChatInputAction[]>([]);

  /**
   * Whether file attachments are supported
   * @defaultValue false
   */
  readonly allowAttachments = input(false);

  /**
   * Accepted file types for attachments
   * @defaultValue []
   */
  readonly acceptedFileTypes = input<string[]>([]);

  /**
   * Maximum file size in bytes
   * @defaultValue 10485760 (10MB)
   */
  readonly maxFileSize = input(10485760);

  /**
   * Custom template for empty state
   */
  readonly emptyStateTemplate = input<TemplateRef<any>>();

  /**
   * Title for empty state
   * @defaultValue 'Start a conversation'
   */
  readonly emptyStateTitle = input<TranslatableString>('Start a conversation');

  /**
   * Description for empty state
   * @defaultValue 'Send a message to begin chatting'
   */
  readonly emptyStateDescription = input<TranslatableString>('Send a message to begin chatting');

  /**
   * Auto-scroll to bottom when new messages are added
   * @defaultValue true
   */
  readonly autoScroll = input(true);

  /**
   * Maximum height of the chat container
   */
  readonly maxHeight = input<string>();

  /**
   * Emitted when a new message is sent
   */
  readonly messageSent = output<{
    content: string;
    attachments: ChatInputAttachment[];
  }>();

  /**
   * Emitted when a message action is triggered
   */
  readonly messageAction = output<{
    messageId: string;
    actionId: string;
    message: ChatMessage;
  }>();

  /**
   * Emitted when an attachment is clicked
   */
  readonly attachmentClick = output<{
    messageId: string;
    attachment: UserMessageAttachment;
  }>();

  protected readonly isEmpty = computed(() => this.messages().length === 0);

  protected readonly isLoading = computed(
    () => this.messages().some(message => message.loading) || this.sending()
  );

  protected readonly emptyStateContext = computed(() => ({
    title: this.emptyStateTitle(),
    description: this.emptyStateDescription()
  }));

  // Primary actions for the chat input, make sure there are only 3 (or 2 if one is the "more actions" button), allow attachments also counts as an action.
  protected readonly inputPrimaryActions = computed(() => {
    const actions = this.inputActions();
    const hasAttachmentAction = this.allowAttachments() ? 1 : 0;

    // Show all actions if there are 3 or fewer total actions
    if (actions.length <= 3 - hasAttachmentAction) {
      return actions;
    }

    // Otherwise, show only the first 2 (or 1 if attachment is primary)
    return actions.slice(0, 2 - hasAttachmentAction);
  });

  // Secondary actions for the chat input, these are shown in the "more actions" menu
  protected readonly inputSecondaryActions = computed(() => {
    const actions = this.inputActions();
    const hasAttachmentAction = this.allowAttachments() ? 1 : 0;
    // Only show secondary actions if there are more than 3 total actions
    if (actions.length <= 3 - hasAttachmentAction) {
      return [];
    }
    // Return all actions after the first 2 (or 1 if attachment is primary)
    return actions.slice(2 - hasAttachmentAction);
  });

  constructor() {
    // Watch for changes in messages and handle auto-scroll
    effect(() => {
      const currentMessages = this.messages();
      const currentCount = currentMessages.length;

      // Initial load: scroll to bottom if there are messages
      if (this.autoScroll() && this.lastMessageCount === 0 && currentCount > 0) {
        setTimeout(() => {
          this.scrollToBottom();
          this.isUserAtBottom = true;
        }, 0);
      }
      // New messages: check if we should scroll
      else if (this.autoScroll() && currentCount > this.lastMessageCount) {
        // Get the newest message(s)
        const newMessages = currentMessages.slice(this.lastMessageCount);
        const hasNewUserMessage = newMessages.some(msg => msg.type === 'user');

        // Always scroll on user messages, only scroll on AI messages if user was at bottom
        if (hasNewUserMessage || this.isUserAtBottom) {
          setTimeout(() => {
            this.scrollToBottom();
          }, 0);
        }
      }

      this.lastMessageCount = currentCount;
    });

    // Also watch for loading state changes (when AI message finishes loading)
    effect(() => {
      const isCurrentlyLoading = this.isLoading();

      // If we were loading and now we're not, and user is at bottom, scroll to bottom
      if (this.autoScroll() && !isCurrentlyLoading && this.isUserAtBottom) {
        setTimeout(() => {
          this.scrollToBottom();
        }, 0);
      }
    });
  }

  private scrollToBottom(): void {
    if (this.messagesContainer?.nativeElement) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  private checkIfUserAtBottom(): void {
    if (this.messagesContainer?.nativeElement) {
      const element = this.messagesContainer.nativeElement;
      const threshold = 50; // 50px threshold to account for minor scroll differences
      this.isUserAtBottom =
        element.scrollTop + element.clientHeight >= element.scrollHeight - threshold;
    }
  }

  protected onScroll(): void {
    this.checkIfUserAtBottom();
  }

  protected onMessageSent(event: { content: string; attachments: ChatInputAttachment[] }): void {
    this.messageSent.emit(event);
  }

  protected onUserMessageAction(action: UserMessageAction, messageId: string): void {
    const message = this.messages().find(m => m.id === messageId);
    if (message) {
      this.messageAction.emit({
        messageId,
        actionId: action.id,
        message
      });
    }
  }

  protected onAiMessageAction(action: AiMessageAction, messageId: string): void {
    const message = this.messages().find(m => m.id === messageId);
    if (message) {
      this.messageAction.emit({
        messageId,
        actionId: action.id,
        message
      });
    }
  }

  protected onAttachmentClick(attachment: UserMessageAttachment, messageId: string): void {
    this.attachmentClick.emit({
      messageId,
      attachment
    });
  }

  protected trackByMessageId(index: number, message: ChatMessage): string {
    return message.id;
  }

  protected getAiMessagePrimaryActions(message: ChatMessage): AiMessageAction[] {
    if (message.type !== 'ai' || !message.actions) return [];
    const aiActions = message.actions as AiMessageAction[];
    // If there are 3 or fewer actions, show them all as primary
    if (aiActions.length <= 3) {
      return aiActions;
    }
    // If there are more than 3, show first 2 as primary
    return aiActions.slice(0, 2);
  }

  protected getAiMessageSecondaryActions(message: ChatMessage): AiMessageAction[] {
    if (message.type !== 'ai' || !message.actions) return [];
    const aiActions = message.actions as AiMessageAction[];
    // Only show secondary actions if there are more than 3 total actions
    if (aiActions.length <= 3) {
      return [];
    }
    return aiActions.slice(2);
  }
}
