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
  booleanAttribute,
  inject,
  contentChild,
  Signal,
  isSignal,
  effect
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BackgroundColorVariant } from '@siemens/element-ng/common';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';
import { SiInlineNotificationComponent } from '@siemens/element-ng/inline-notification';
import { getMarkdownRenderer } from '@siemens/element-ng/markdown-renderer';
import { MenuItem } from '@siemens/element-ng/menu';
import { SiResponsiveContainerDirective } from '@siemens/element-ng/resize-observer';
import { TranslatableString, t } from '@siemens/element-translate-ng/translate';

import {
  AiChatMessage,
  ChatMessage,
  MessageAction,
  TemplateChatMessage
} from './chat-message.model';
import { SiAiMessageComponent } from './si-ai-message.component';
import { SiChatContainerInputDirective } from './si-chat-container-input.directive';
import { SiChatContainerComponent } from './si-chat-container.component';
import { ChatInputAttachment, SiChatInputComponent } from './si-chat-input.component';
import { SiUserMessageComponent } from './si-user-message.component';

/**
 * A model-driven chat container component for displaying an AI chat interface with automatic scroll-to-bottom behavior.
 *
 * This component an A chat interface, managing scrolling behavior
 * to keep the newest messages visible while respecting user scrolling actions. It automatically
 * scrolls to the bottom when new content is added, unless the user has scrolled up to view older messages.
 *
 * Required content projection:
 * - `si-chat-input`: Input controls for composing messages
 *
 * @see {@link ChatMessage} for the chat message model
 * @see {@link AiChatMessage} for the AI chat message model
 * @see {@link UserChatMessage} for the user chat message model
 * @see {@link TemplateChatMessage} for the template chat message model
 * @see {@link SiChatInputComponent} for the chat input component
 * @see {@link SiChatContainerComponent} for the base chat container component
 * @see {@link SiAiMessageComponent} for the used AI message component
 * @see {@link SiUserMessageComponent} for the used user message component
 * @see {@link SiChatMessageComponent} for the base wrapper chat message component used by AI and user message components
 *
 * @experimental
 */
@Component({
  selector: 'si-ai-chat-container',
  imports: [
    NgTemplateOutlet,
    SiEmptyStateComponent,
    SiInlineNotificationComponent,
    SiAiMessageComponent,
    SiUserMessageComponent,
    SiChatContainerComponent,
    SiChatContainerInputDirective
  ],
  templateUrl: './si-ai-chat-container.component.html',
  host: {
    class: 'd-flex si-layout-inner flex-grow-1 flex-column h-100 w-100'
  },
  hostDirectives: [SiResponsiveContainerDirective]
})
export class SiAiChatContainerComponent {
  private readonly chatInput = contentChild<SiChatInputComponent>(SiChatInputComponent);
  private sanitizer = inject(DomSanitizer);

  protected markdownRenderer = getMarkdownRenderer(this.sanitizer);

  constructor() {
    effect(() => {
      const inputComponent = this.chatInput();
      if (inputComponent) {
        inputComponent.registerStates(this.inputSending, this.inputInterruptible);
      }
    });
  }

  private messageActionsCache = new WeakMap<
    ChatMessage,
    { primary: MessageAction[]; secondary: MenuItem[]; version: number }
  >();

  private messageVersions = new Map<ChatMessage, number>();

  /**
   * List of chat messages to display. Messages can contain either content (string)
   * or a template (TemplateRef) for custom rendering. When both content and template
   * are provided, the template takes precedence.
   * Leave undefined to manage messages via ng-content instead.
   */
  readonly messages = input<ChatMessage[] | undefined>();

  /**
   * Whether a message is currently being sent, disables input and shows a loading state in the input area.
   * If you want to show a loading state for the latest AI message, set {@link loading} to true instead.
   * @defaultValue false
   */
  readonly sending = input(false, { transform: booleanAttribute });

  /**
   * Whether a pending loading AI message should be shown (e.g. while waiting for response).
   * If you also want to prevent the user from sending new messages, set {@link sending} to true as well.
   * @defaultValue false
   */
  readonly loading = input(false, { transform: booleanAttribute });

  /**
   * Whether to disable the interrupt functionality
   * @defaultValue false
   */
  readonly disableInterrupt = input(false, { transform: booleanAttribute });

  /**
   * Whether the system is currently interrupting an operation. When true,
   * forces interruptible mode and shows sending state on the input.
   * @defaultValue false
   */
  readonly interrupting = input(false, { transform: booleanAttribute });

  /**
   * Disable auto-scroll to bottom when new messages are added
   * @defaultValue false
   */
  readonly noAutoScroll = input(false, { transform: booleanAttribute });

  /**
   * Custom AI icon name, used for empty state
   * @defaultValue 'element-ai'
   */
  readonly aiIcon = input('element-ai');

  /**
   * Color to use for component background.
   * @defaultValue 'base-0'
   */
  readonly colorVariant = input<BackgroundColorVariant>('base-0');

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
   * More actions button aria label
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_CONTAINER.SECONDARY_ACTIONS:More actions`)
   * ```
   */
  readonly secondaryActionsLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_CHAT_CONTAINER.SECONDARY_ACTIONS:More actions`)
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

  /**
   * Emitted when a new message is sent
   */
  readonly messageSent = output<{
    content: string;
    attachments: ChatInputAttachment[];
  }>();

  protected readonly isEmpty = computed(() => this.messages()?.length === 0 && !this.loading());

  protected readonly inputInterruptible = computed(() => {
    return this.interrupting() || (this.loading() && !this.disableInterrupt() && !this.sending());
  });

  protected readonly inputSending = computed(() => {
    return this.sending() || this.interrupting();
  });

  protected readonly displayMessages = computed(() => {
    const messages = this.messages();
    if (!messages?.length) {
      if (this.loading()) {
        const loadingMessage: AiChatMessage = {
          type: 'ai',
          content: '',
          loading: true
        };
        return [loadingMessage];
      }
      return [];
    }

    if (this.loading() && messages.length > 0) {
      const latestMessage = messages[messages.length - 1];

      const shouldAddAiMessage =
        this.isTemplateMessage(latestMessage) ||
        (latestMessage.type === 'ai' &&
          this.getContentValue(latestMessage.content) &&
          !this.getLoadingState(latestMessage.loading, latestMessage.content, false) &&
          !this.isStreamingContent(latestMessage.content)) ||
        latestMessage.type === 'user';

      if (shouldAddAiMessage) {
        const newMessages = [...messages];
        const loadingMessage: AiChatMessage = {
          type: 'ai',
          content: '',
          loading: true
        };
        newMessages.push(loadingMessage);
        return newMessages;
      }
    }

    return messages;
  });

  private getMessageActions(message: ChatMessage): {
    primary: MessageAction[];
    secondary: MenuItem[];
    version: number;
  } {
    if (this.isTemplateMessage(message)) {
      return { primary: [], secondary: [], version: 0 };
    }

    const actions = message.actions ?? [];

    // Get or create version number for this message
    const version = this.messageVersions.get(message) ?? 0;

    // Check if we have a cached version that matches
    const cached = this.messageActionsCache.get(message);
    if (cached?.version === version) {
      return cached;
    }

    // Build primary and secondary actions
    const primary = actions.slice(0, 3);
    const secondary = actions.slice(3).map(
      action =>
        ({
          ...action,
          action: action.action as unknown as (actionParam: any, source: MenuItem) => void,
          type: 'action'
        }) as MenuItem
    );

    const result = { primary, secondary, version };
    this.messageActionsCache.set(message, result);

    // Return the cached object to maintain reference equality
    return result;
  }

  protected isTemplateMessage(message: ChatMessage): message is TemplateChatMessage {
    return 'template' in message && message.template !== undefined;
  }

  protected getMessagePrimaryActions(message: ChatMessage): MessageAction[] {
    return this.getMessageActions(message).primary;
  }

  protected getMessageSecondaryActions(message: ChatMessage): MenuItem[] {
    return this.getMessageActions(message).secondary;
  }

  public focus(): void {
    const inputComponent = this.chatInput();
    if (inputComponent) {
      inputComponent.focus();
    }
  }

  protected getContentValue(content: string | Signal<string> | undefined): string {
    if (isSignal(content)) {
      return content();
    }
    return content ?? '';
  }

  protected getOutputValue(content: string | Signal<string> | undefined): string | Signal<string> {
    return content ?? '';
  }

  private isEmptyContent(content: string | Signal<string> | undefined): boolean {
    const contentValue = this.getContentValue(content);
    return !contentValue || contentValue.trim().length === 0;
  }

  private getLoadingValue(loading: boolean | Signal<boolean> | undefined): boolean {
    if (isSignal(loading)) {
      return loading();
    }
    return loading ?? false;
  }

  private isStreamingContent(content: string | Signal<string> | undefined): boolean {
    return isSignal(content) && this.getContentValue(content).trim().length > 0;
  }

  protected getLoadingState(
    messageLoading: boolean | Signal<boolean> | undefined,
    content: string | Signal<string> | undefined,
    isLatest: boolean,
    globalLoading: boolean = false
  ): boolean {
    const messageLoadingValue = this.getLoadingValue(messageLoading);
    const isEmptyContent = this.isEmptyContent(content);

    return messageLoadingValue || (isLatest && globalLoading && isEmptyContent);
  }

  protected isLatestMessage(message: ChatMessage): boolean {
    const messages = this.displayMessages();
    return messages[messages.length - 1] === message;
  }

  protected readonly isSignal = isSignal;
}
