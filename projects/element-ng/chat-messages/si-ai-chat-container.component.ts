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
  effect,
  viewChild
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BackgroundColorVariant } from '@siemens/element-ng/common';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';
import { SiInlineNotificationComponent } from '@siemens/element-ng/inline-notification';
import {
  getMarkdownRenderer,
  MarkdownRendererOptions
} from '@siemens/element-ng/markdown-renderer';
import { MenuItem } from '@siemens/element-ng/menu';
import { SiResponsiveContainerDirective } from '@siemens/element-ng/resize-observer';
import {
  TranslatableString,
  injectSiTranslateService,
  t
} from '@siemens/element-translate-ng/translate';

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
import { SiToolMessageComponent } from './si-tool-message.component';
import { SiUserMessageComponent } from './si-user-message.component';

/**
 * A model-driven chat container component for displaying an AI chat interface with automatic scroll-to-bottom behavior.
 *
 * This component provides an AI chat interface, managing scrolling behavior
 * to keep the newest messages visible while respecting user scrolling actions. It automatically
 * scrolls to the bottom when new content is added, unless the user has scrolled up to view older messages.
 *
 * Required content projection:
 * - `si-chat-input`: Input controls for composing messages
 *
 * @see {@link ChatMessage} for the chat message model
 * @see {@link AiChatMessage} for the AI chat message model
 * @see {@link UserChatMessage} for the user chat message model
 * @see {@link ToolChatMessage} for the tool chat message model
 * @see {@link TemplateChatMessage} for the template chat message model
 * @see {@link SiChatInputComponent} for the chat input component
 * @see {@link SiChatContainerComponent} for the base chat container component
 * @see {@link SiAiMessageComponent} for the used AI message component
 * @see {@link SiUserMessageComponent} for the used user message component
 * @see {@link SiToolMessageComponent} for the used tool message component
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
    SiToolMessageComponent,
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
  private readonly chatContainer = viewChild<SiChatContainerComponent>(SiChatContainerComponent);
  private sanitizer = inject(DomSanitizer);
  private translateService = injectSiTranslateService();

  constructor() {
    effect(() => {
      const inputComponent = this.chatInput();
      if (inputComponent) {
        inputComponent.registerParent(this.inputSending, this.inputInterruptible, () => {
          this.scrollToBottom();
        });
      }
    });
  }

  private messageActionsCache = new WeakMap<
    ChatMessage,
    { primary: MessageAction[]; secondary: MenuItem[]; version: number }
  >();

  private messageVersions = new WeakMap<ChatMessage, number>();

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
   * Do not display the copy code button.
   * @defaultValue false
   */
  readonly disableCopyCodeButton = input<boolean>(false);

  /**
   * Do not display the download CSV button for tables.
   * @defaultValue false
   */
  readonly disableDownloadTableButton = input<boolean>(false);

  /**
   * Optional syntax highlighter function for code blocks.
   * Receives code content and optional language, returns an HTML content string to display inside of the code block or undefined to use default rendering.
   * The returned code is sanitized before insertion.
   * Make sure that the required styles/scripts for the syntax highlighter are included in your application.
   * @defaultValue undefined
   */
  readonly syntaxHighlighter = input<
    ((code: string, language?: string) => string | undefined) | undefined
  >(undefined);

  /**
   * Label for the copy button.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_MARKDOWN_RENDERER.COPY:Copy`)
   * ```
   */
  readonly copyCodeButtonLabel = input(t(() => $localize`:@@SI_MARKDOWN_RENDERER.COPY:Copy`));

  /**
   * Label for the download CSV button.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_MARKDOWN_RENDERER.DOWNLOAD:Download CSV`)
   * ```
   */
  readonly downloadTableButtonLabel = input(
    t(() => $localize`:@@SI_MARKDOWN_RENDERER.DOWNLOAD:Download CSV`)
  );

  /**
   * Title for empty state
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_AI_CHAT_CONTAINER.EMPTY_STATE_TITLE:Start a conversation`)
   * ```
   */
  readonly emptyStateTitle = input<TranslatableString>(
    t(() => $localize`:@@SI_AI_CHAT_CONTAINER.EMPTY_STATE_TITLE:Start a conversation`)
  );

  /**
   * Description for empty state
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_AI_CHAT_CONTAINER.EMPTY_STATE_DESCRIPTION:Send a message to begin chatting`)
   * ```
   */
  readonly emptyStateDescription = input<TranslatableString>(
    t(
      () =>
        $localize`:@@SI_AI_CHAT_CONTAINER.EMPTY_STATE_DESCRIPTION:Send a message to begin chatting`
    )
  );

  /**
   * More actions button aria label
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_AI_CHAT_CONTAINER.SECONDARY_ACTIONS:More actions`)
   * ```
   */
  readonly secondaryActionsLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_AI_CHAT_CONTAINER.SECONDARY_ACTIONS:More actions`)
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
   * Label for tool message input arguments section
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_TOOL_MESSAGE.INPUT_ARGUMENTS:Input Arguments`)
   * ```
   */
  readonly toolInputArgumentsLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_TOOL_MESSAGE.INPUT_ARGUMENTS:Input Arguments`)
  );

  /**
   * Label for tool message output section
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_TOOL_MESSAGE.OUTPUT:Output`)
   * ```
   */
  readonly toolOutputLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_TOOL_MESSAGE.OUTPUT:Output`)
  );

  /**
   * Emitted when a new message is sent
   */
  readonly messageSent = output<{
    content: string;
    attachments: ChatInputAttachment[];
  }>();

  protected readonly markdownRenderer = computed(() => {
    const highlighterFn = this.syntaxHighlighter();

    const options: MarkdownRendererOptions | undefined = {
      copyCodeButton: !this.disableCopyCodeButton() ? this.copyCodeButtonLabel() : undefined,
      downloadTableButton: !this.disableDownloadTableButton()
        ? this.downloadTableButtonLabel()
        : undefined,
      syntaxHighlighter: highlighterFn,
      translateSync: this.translateService.translateSync.bind(this.translateService)
    };

    return getMarkdownRenderer(this.sanitizer, options);
  });

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
        // If loading but no messages, show a single loading AI message
        const loadingMessage: AiChatMessage = {
          type: 'ai',
          content: '',
          loading: true
        };
        return [loadingMessage];
      }
      return [];
    }

    // If global loading is true, check if we need to add an AI message
    if (this.loading() && messages.length > 0) {
      const latestMessage = messages[messages.length - 1];

      if (this.shouldInjectLoadingMessage(latestMessage)) {
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

  /**
   * Determines if a loading AI message should be injected after the given message.
   * Returns true unless the latest message is an AI message that's either empty, currently loading, or streaming.
   */
  private shouldInjectLoadingMessage(latestMessage: ChatMessage): boolean {
    if (this.isTemplateMessage(latestMessage)) return true;
    if (latestMessage.type !== 'ai') return true;

    // Don't inject if AI message is empty/loading/streaming
    const hasContent = !!this.getContentValue(latestMessage.content);
    const isLoading = this.getLoadingState(latestMessage.loading, latestMessage.content, false);
    const isStreaming = this.isStreamingContent(latestMessage.content);

    return hasContent && !isLoading && !isStreaming;
  }

  private getMessageActions(message: ChatMessage): {
    primary: MessageAction[];
    secondary: MenuItem[];
    version: number;
  } {
    if (this.isTemplateMessage(message) || message.type === 'tool') {
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

  /**
   * Scrolls to the bottom of the messages container immediately.
   * This method forces a scroll even if the user has scrolled up.
   */
  public scrollToBottom(): void {
    this.chatContainer()?.scrollToBottom();
  }

  /**
   * Focuses the chat input component if it exists.
   */
  public focus(): void {
    const inputComponent = this.chatInput();
    if (inputComponent) {
      inputComponent.focus();
    }
  }

  protected getContentValue<T extends string | object>(content: T | Signal<T> | undefined): T {
    if (!content) return '' as T;
    return isSignal(content) ? (content as Signal<T>)() : content;
  }

  protected getOutputValue(
    outputValue: string | object | Signal<string | object> | undefined
  ): string | object | undefined {
    if (outputValue === undefined || outputValue === null) return undefined;
    return isSignal(outputValue) ? (outputValue as Signal<string | object>)() : outputValue;
  }

  private isEmptyContent(content: string | object | Signal<string | object> | undefined): boolean {
    const contentValue = this.getContentValue(content);

    return !contentValue;
  }

  private getLoadingValue(loading: boolean | Signal<boolean> | undefined): boolean {
    return loading !== undefined ? (isSignal(loading) ? loading() : loading) : false;
  }

  private isStreamingContent(
    content: string | object | Signal<string | object> | undefined
  ): boolean {
    return isSignal(content) && !this.isEmptyContent(content);
  }

  /**
   * Helper method to get loading state from boolean or signal
   *
   * Behavior:
   * - Shows loading when content is empty and allowEmptyContent is false
   * - Shows loading when message.loading is true
   * - Shows loading when it's the latest message, globalLoading is true, and content is empty
   *
   * @param messageLoading - The loading state of the individual message
   * @param content - The content of the message
   * @param isLatest - Whether this is the latest message in the list
   * @param globalLoading - The global loading state for the chat container
   * @param allowEmptyContent - Whether to allow empty content without showing loading
   * @returns Whether to show the loading state
   */
  protected getLoadingState(
    messageLoading: boolean | Signal<boolean> | undefined,
    content: string | object | Signal<string | object> | undefined,
    isLatest: boolean,
    globalLoading: boolean = false,
    allowEmptyContent: boolean = false
  ): boolean {
    const messageLoadingValue = this.getLoadingValue(messageLoading);
    const isEmptyContent = this.isEmptyContent(content);

    // If the content is empty, always show loading (unless allowEmptyContent is true)
    if (isEmptyContent && !allowEmptyContent) {
      return true;
    }

    return messageLoadingValue || (isLatest && globalLoading && isEmptyContent);
  }

  protected isLatestMessage(message: ChatMessage): boolean {
    const messages = this.displayMessages();
    if (!messages || messages.length === 0) return false;
    return messages[messages.length - 1] === message;
  }
  private isLatestToolMessage(message: ChatMessage): boolean {
    const messages = this.displayMessages();
    if (!messages || messages.length === 0) return false;

    const messageIndex = messages.findIndex(m => m === message);
    if (messageIndex === -1) return false;

    if (messageIndex === messages.length - 1) return true;

    if (messageIndex < messages.length - 2) return false;

    const nextMessage = messages[messageIndex + 1];

    // Auto-expand only applies when an AI response is being generated.
    // If a user message or another tool message follows, this is no longer the latest tool call.
    if (!this.isTemplateMessage(nextMessage) && nextMessage.type === 'ai') return true;

    return false;
  }

  protected shouldAutoExpandInputArguments(message: ChatMessage): boolean {
    if (this.isTemplateMessage(message) || message.type !== 'tool') return false;
    if (!message.autoExpandInputArguments) {
      return false;
    }
    return this.isLatestToolMessage(message);
  }

  protected shouldAutoExpandOutput(message: ChatMessage): boolean {
    if (this.isTemplateMessage(message) || message.type !== 'tool') return false;
    if (!message.autoExpandOutput) {
      return false;
    }
    return this.isLatestToolMessage(message);
  }

  protected readonly isSignal = isSignal;
}
