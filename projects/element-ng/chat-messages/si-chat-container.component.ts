/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  Component,
  computed,
  input,
  output,
  ViewChild,
  ElementRef,
  effect,
  booleanAttribute
} from '@angular/core';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';
import { SiInlineNotificationComponent } from '@siemens/element-ng/inline-notification';
import { MenuItemAction } from '@siemens/element-ng/menu';
import { SiResponsiveContainerDirective } from '@siemens/element-ng/resize-observer';
import { t, TranslatableString } from '@siemens/element-translate-ng/translate';

import { ActionBarItem } from './si-action-bar.component';
import { SiAiMessageComponent } from './si-ai-message.component';
import { type AttachmentItem } from './si-attachment-list.component';
import { SiChatInputComponent, ChatInputAttachment } from './si-chat-input.component';
import { SiUserMessageComponent } from './si-user-message.component';

export interface BaseChatMessage {
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
}

export interface UserChatMessage extends BaseChatMessage {
  /** Type of message */
  type: 'user';
  /** Attachments (for user messages) */
  attachments?: AttachmentItem[];
  /** Actions available for this message */
  actions?: MenuItemAction[];
}

export interface AiChatMessage extends BaseChatMessage {
  /** Type of message */
  type: 'ai';
  /** Actions available for this message */
  actions?: ActionBarItem[];
}

export type ChatMessage = UserChatMessage | AiChatMessage;

@Component({
  selector: 'si-chat-container',
  imports: [
    SiEmptyStateComponent,
    SiInlineNotificationComponent,
    SiAiMessageComponent,
    SiUserMessageComponent,
    SiChatInputComponent,
    SiResponsiveContainerDirective
  ],
  templateUrl: './si-chat-container.component.html',
  styleUrl: './si-chat-container.component.scss'
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
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * Whether a message is currently being sent/processed
   * @defaultValue false
   */
  readonly sending = input(false, { transform: booleanAttribute });

  /**
   * Disclaimer text, set to undefined to disable.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_INPUT.DISCLAIMER:Please verify important information.`)
   * ```
   */
  readonly disclaimer = input<TranslatableString | undefined>(
    t(() => $localize`:@@SI_CHAT_INPUT.DISCLAIMER:Please verify important information.`)
  );

  /**
   * Actions available in the chat input
   * @defaultValue []
   */
  readonly inputActions = input<ActionBarItem[]>([]);

  /**
   * Whether file attachments are supported
   * @defaultValue false
   */
  readonly allowAttachments = input(false, { transform: booleanAttribute });

  /**
   * Disable auto-scroll to bottom when new messages are added
   * @defaultValue false
   */
  readonly noAutoScroll = input(false, { transform: booleanAttribute });

  /**
   * Custom AI icon name, used for AI messages and empty state
   * @defaultValue 'element-ai'
   */
  readonly aiIcon = input('element-ai');

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
   * Placeholder text for the input
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_INPUT.PLACEHOLDER:Type a message...`)
   * ```
   */
  readonly inputPlaceholder = input<TranslatableString>(
    t(() => $localize`:@@SI_CHAT_INPUT.PLACEHOLDER:Type a message...`)
  );

  /**
   * Status notification severity
   */
  readonly statusSeverity = input<
    'info' | 'success' | 'caution' | 'warning' | 'danger' | 'critical'
  >();

  /**
   * Status notification heading
   */
  readonly statusHeading = input<string>();

  /**
   * Status notification message
   */
  readonly statusMessage = input<string>();

  /**
   * Status notification action link
   */
  readonly statusAction = input<{ title: string; href: string; target?: string }>();

  /** Parameter to pass to action handlers */
  readonly actionParam = input();

  /**
   * Title for empty state
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_CONTAINER.EMPTY_STATE_TITLE:Start a conversation`)
   * ```
   */
  readonly emptyStateTitle = input<TranslatableString>(
    t(() => $localize`:@@SI_CHAT_CONTAINER.EMPTY_STATE_TITLE:Start a conversation`)
  );

  /**
   * Description for empty state
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_CONTAINER.EMPTY_STATE_DESCRIPTION:Send a message to begin chatting`)
   * ```
   */
  readonly emptyStateDescription = input<TranslatableString>(
    t(
      () => $localize`:@@SI_CHAT_CONTAINER.EMPTY_STATE_DESCRIPTION:Send a message to begin chatting`
    )
  );

  /**
   * Alt text for AI icon
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_AI_MESSAGE.AI_ASSISTANT:AI Assistant`)
   * ```
   */
  readonly aiIconAltText = input<TranslatableString>(
    t(() => $localize`:@@SI_AI_MESSAGE.AI_ASSISTANT:AI Assistant`)
  );

  /**
   * Send button label
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_INPUT.SEND:Send`)
   * ```
   */
  readonly sendButtonLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_CHAT_INPUT.SEND:Send`)
  );

  /**
   * Send button icon
   *
   * @defaultValue 'element-send-filled'
   */
  readonly sendButtonIcon = input('element-send-filled');

  /**
   * Attach file button aria label
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_INPUT.ATTACH_FILE:Attach file`)
   * ```
   */
  readonly attachFileLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_CHAT_INPUT.ATTACH_FILE:Attach file`)
  );

  /**
   * Remove attachment aria label prefix
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_ATTACHMENT_LIST.REMOVE_ATTACHMENT:Remove attachment`)
   * ```
   */
  readonly removeAttachmentLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_ATTACHMENT_LIST.REMOVE_ATTACHMENT:Remove attachment`)
  );

  /**
   * More actions button aria label
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_ACTION_BAR.SECONDARY_ACTIONS:More actions`)
   * ```
   */
  readonly secondaryActionsLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_ACTION_BAR.SECONDARY_ACTIONS:More actions`)
  );

  /**
   * Aria label for user message actions button
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_USER_MESSAGE.MESSAGE_ACTIONS:Message actions`)
   * ```
   */
  readonly userMessageActionsLabel = input(
    t(() => $localize`:@@SI_USER_MESSAGE.MESSAGE_ACTIONS:Message actions`)
  );

  /**
   * Emitted when a new message is sent
   */
  readonly messageSent = output<{
    content: string;
    attachments: ChatInputAttachment[];
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

    if (actions.length <= 3 - hasAttachmentAction) {
      return actions;
    }

    return actions.slice(0, 2 - hasAttachmentAction);
  });

  protected readonly inputSecondaryActions = computed(() => {
    const actions = this.inputActions();
    const hasAttachmentAction = this.allowAttachments() ? 1 : 0;
    if (actions.length <= 3 - hasAttachmentAction) {
      return [];
    }
    return actions.slice(2 - hasAttachmentAction).map(
      action =>
        ({
          ...action,
          icon: action.icon
        }) as MenuItemAction
    );
  });

  constructor() {
    effect(() => {
      const currentMessages = this.messages();
      const currentCount = currentMessages.length;

      if (!this.noAutoScroll() && this.lastMessageCount === 0 && currentCount > 0) {
        setTimeout(() => {
          this.scrollToBottom();
          this.isUserAtBottom = true;
        }, 0);
      } else if (!this.noAutoScroll() && currentCount > this.lastMessageCount) {
        const newMessages = currentMessages.slice(this.lastMessageCount);
        const hasNewUserMessage = newMessages.some(msg => msg.type === 'user');

        if (hasNewUserMessage || this.isUserAtBottom) {
          setTimeout(() => {
            this.scrollToBottom();
          }, 0);
        }
      }

      this.lastMessageCount = currentCount;
    });

    effect(() => {
      const isCurrentlyLoading = this.isLoading();

      if (!this.noAutoScroll() && !isCurrentlyLoading && this.isUserAtBottom) {
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
      const threshold = 50;
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

  protected trackByMessageId(index: number, message: ChatMessage): string {
    return message.id;
  }

  protected getAiMessagePrimaryActions(message: ChatMessage): ActionBarItem[] {
    if (message.type !== 'ai' || !message.actions) return [];
    const aiActions = message.actions as ActionBarItem[];
    if (aiActions.length <= 3) {
      return aiActions;
    }
    return aiActions.slice(0, 2);
  }

  protected getAiMessageSecondaryActions(message: ChatMessage): MenuItemAction[] {
    if (message.type !== 'ai' || !message.actions) return [];
    const aiActions = message.actions as MenuItemAction[];
    if (aiActions.length <= 3) {
      return [];
    }
    return aiActions.slice(2);
  }
}
