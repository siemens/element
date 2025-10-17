/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import {
  Component,
  computed,
  input,
  output,
  effect,
  booleanAttribute,
  inject,
  model,
  viewChild,
  ElementRef,
  OnDestroy,
  TemplateRef,
  AfterContentInit,
  PLATFORM_ID,
  Signal,
  isSignal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BackgroundColorVariant } from '@siemens/element-ng/common';
import { SiEmptyStateComponent } from '@siemens/element-ng/empty-state';
import { FileUploadError } from '@siemens/element-ng/file-uploader';
import { SiInlineNotificationComponent } from '@siemens/element-ng/inline-notification';
import { MenuItemAction } from '@siemens/element-ng/menu';
import { SiResponsiveContainerDirective } from '@siemens/element-ng/resize-observer';
import { SiToastNotificationService } from '@siemens/element-ng/toast-notification';
import { TranslatableString, t } from '@siemens/element-translate-ng/translate';

import { ActionBarItem } from './si-action-bar.component';
import { SiAiMessageComponent } from './si-ai-message.component';
import { type AttachmentItem } from './si-attachment-list.component';
import { SiChatInputComponent, ChatInputAttachment } from './si-chat-input.component';
import { SiToolMessageComponent } from './si-tool-message.component';
import { SiUserMessageComponent } from './si-user-message.component';

/**
 * Base interface for all chat messages. Messages can be rendered either with content
 * or with a custom template for advanced styling and functionality.
 */
export interface BaseChatMessage {
  /** Unique identifier for the message */
  id: string;
  /** Type of message */
  type: 'user' | 'ai' | 'tool';
  /** Message content - can be a string or a Signal<string>, empty string shows loading state */
  content?: string | Signal<string>;
  /** Whether the message is currently loading/being generated - can be a boolean or Signal<boolean> */
  loading?: boolean | Signal<boolean>;
  /**
   * Optional template to render instead of content. When provided, the content
   * property (as well as any actions or attachments) will be ignored.
   */
  template?: TemplateRef<any>;
}

export interface UserChatMessage extends BaseChatMessage {
  /** Type of message */
  type: 'user';
  /** Message content, should be a string, empty string shows loading state */
  content: string;
  /** Attachments (for user messages) */
  attachments?: AttachmentItem[];
  /** Actions available for this message */
  actions?: ActionBarItem[];
}

export interface AiChatMessage extends BaseChatMessage {
  /** Type of message */
  type: 'ai';
  /** Message content - can be a string or a Signal<string>, empty string shows loading state, set signal back to string to end "streaming" state */
  content: string | Signal<string>;
  /** Actions available for this message */
  actions?: ActionBarItem[];
}

/** @experimental */
export interface ToolChatMessage extends BaseChatMessage {
  /** Type of message */
  type: 'tool';
  /** Tool name/title */
  name: string;
  /** Input arguments for the tool call */
  inputArguments?: string | object;
  /** Output result from the tool call - can be a string/object or Signal\<string | object\>, empty does not show loading state. */
  output?: string | object | Signal<string | object>;
  /** Whether the input arguments section should be expanded by default if it's the latest message (and closed after) */
  autoExpandInputArguments?: boolean;
  /** Whether the output section should be expanded by default if it's the latest message (and closed after) */
  autoExpandOutput?: boolean;
  /** Alternative tool icon, defaults to 'element-maintenance' */
  icon?: string;
}

export interface TemplateChatMessage extends BaseChatMessage {
  /** Type of message */
  template: TemplateRef<any>;
}

export type ChatMessage = UserChatMessage | AiChatMessage | ToolChatMessage;

/** @experimental */
@Component({
  selector: 'si-chat-container',
  imports: [
    FormsModule,
    NgTemplateOutlet,
    SiEmptyStateComponent,
    SiInlineNotificationComponent,
    SiAiMessageComponent,
    SiToolMessageComponent,
    SiUserMessageComponent,
    SiChatInputComponent
  ],
  templateUrl: './si-chat-container.component.html',
  styleUrl: './si-chat-container.component.scss',
  host: {
    class: 'd-flex si-layout-inner flex-grow-1 flex-column h-100 w-100',
    '[class]': 'colorVariant()'
  },
  hostDirectives: [SiResponsiveContainerDirective]
})
export class SiChatContainerComponent implements OnDestroy, AfterContentInit {
  private readonly messagesContainer = viewChild<ElementRef>('messagesContainer');
  private readonly chatInput = viewChild<SiChatInputComponent>('chatInput');
  private toastNotificationService = inject(SiToastNotificationService);
  private platformId = inject(PLATFORM_ID);

  private isUserAtBottom = true;
  private lastMessageCount = 0;
  private lastMessageContents: string[] = [];
  private scrollTimeout?: number;
  private resizeObserver?: ResizeObserver;
  private contentObserver?: MutationObserver;

  /**
   * List of chat messages to display. Messages can contain either content (string)
   * or a template (TemplateRef) for custom rendering. When both content and template
   * are provided, the template takes precedence.
   * Leave undefined to manage messages via ng-content instead.
   */
  readonly messages = input<ChatMessage[] | undefined>();

  /**
   * Whether the chat input is disabled
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

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
   * Disclaimer text, set to undefined to disable.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_CONTAINER.DISCLAIMER:The content is AI generated. Always verify the information for accuracy.`)
   * ```
   */
  readonly disclaimer = input<TranslatableString | undefined>(
    t(
      () =>
        $localize`:@@SI_CHAT_CONTAINER.DISCLAIMER:The content is AI generated. Always verify the information for accuracy.`
    )
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
   * Custom AI icon name, used for empty state
   * @defaultValue 'element-ai'
   */
  readonly aiIcon = input('element-ai');

  /**
   * Accepted file types for attachments (as accept string)
   * @defaultValue undefined
   */
  readonly accept = input<string>();

  /**
   * Maximum file size in bytes
   * @defaultValue 10485760 (10MB)
   */
  readonly maxFileSize = input(10485760);

  /**
   * Current attachments
   * @defaultValue []
   */
  readonly attachments = model<ChatInputAttachment[]>([]);

  /**
   * Color to use for component background.
   * @defaultValue 'base-0'
   */
  readonly colorVariant = input<BackgroundColorVariant>('base-0');

  /**
   * Current input value
   * @defaultValue ''
   */
  readonly inputValue = model<string>('');

  /**
   * Placeholder text for the input
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_CONTAINER.PLACEHOLDER:Enter a command, question or topic…`)
   * ```
   */
  readonly inputPlaceholder = input<TranslatableString>(
    t(() => $localize`:@@SI_CHAT_CONTAINER.PLACEHOLDER:Enter a command, question or topic…`)
  );

  /**
   * Disable auto-focus of the input on component initialization
   * @defaultValue false
   */
  readonly disableAutoFocus = input(false, { transform: booleanAttribute });

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
   * The label for the input, used for accessibility
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_CHAT_INPUT.LABEL:Chat message input`)
   * ```
   */
  readonly inputLabel = input<string>(
    t(() => $localize`:@@SI_CHAT_INPUT.LABEL:Chat message input`)
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

  /**
   * Emitted when the user wants to interrupt the current operation
   */
  readonly interrupt = output<void>();

  protected readonly isEmpty = computed(() => this.messages()?.length === 0 && !this.loading());

  /**
   * Computed property that determines if the input should be in interruptible mode
   * Logic: if loading is true and disableInterrupt is not true and sending is not true, set interruptible true
   * OR if interrupting is true, also set interruptible true
   */
  protected readonly inputInterruptible = computed(() => {
    return this.interrupting() || (this.loading() && !this.disableInterrupt() && !this.sending());
  });

  /**
   * Computed property that determines the effective sending state for the input
   * When interrupting is true, it should also show sending state
   */
  protected readonly inputSending = computed(() => {
    return this.sending() || this.interrupting();
  });

  protected readonly isLoading = computed(
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    () => this.loading() || this.messages()?.some(message => message.loading) || this.sending()
  );

  protected readonly displayMessages = computed(() => {
    const messages = this.messages();
    if (!messages?.length) {
      if (this.loading()) {
        // If loading but no messages, show a single loading AI message
        const loadingMessage: AiChatMessage = {
          id: 'loading',
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

      // Add empty AI message if:
      // 1. Latest message is tool call and global loading is on, OR
      // 2. Latest message has content and not loading, but global loading is on
      const shouldAddAiMessage =
        latestMessage.type === 'tool' ||
        (latestMessage.type === 'ai' &&
          this.getContentValue(latestMessage.content) &&
          !this.getLoadingState(latestMessage.loading, latestMessage.content, false) &&
          !this.isStreamingContent(latestMessage.content)) ||
        latestMessage.type === 'user';

      if (shouldAddAiMessage) {
        const newMessages = [...messages];
        const loadingMessage: AiChatMessage = {
          id: 'loading',
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
          type: 'action'
        }) as MenuItemAction
    );
  });

  constructor() {
    // Track messages and auto-scroll when new messages are added or existing ones update
    effect(() => {
      const currentMessages = this.displayMessages();
      const currentCount = currentMessages.length;
      const currentContents = currentMessages.map(msg => {
        const contentValue = this.getContentValue(msg.content);
        const loadingValue = this.getLoadingValue(msg.loading);
        const contentStr =
          typeof contentValue === 'string' ? contentValue : JSON.stringify(contentValue);
        return contentStr + '|' + loadingValue + '|' + (msg.template ? 'template' : 'content');
      });

      // Initial load - scroll to bottom
      if (!this.noAutoScroll() && this.lastMessageCount === 0 && currentCount > 0) {
        this.debouncedScrollToBottom(0);
        this.isUserAtBottom = true;
      }
      // New messages added
      else if (!this.noAutoScroll() && currentCount > this.lastMessageCount) {
        if (this.isUserAtBottom) {
          this.debouncedScrollToBottom(0);
        }
      }
      // Handle message content updates (e.g., loading messages getting content)
      else if (
        !this.noAutoScroll() &&
        currentCount === this.lastMessageCount &&
        this.isUserAtBottom
      ) {
        const hasContentUpdates =
          this.lastMessageContents.length > 0 &&
          currentContents.some(
            (content, index) => content !== (this.lastMessageContents[index] ?? '')
          );

        if (hasContentUpdates) {
          this.debouncedScrollToBottom(50);
        }
      }

      this.lastMessageCount = currentCount;
      this.lastMessageContents = currentContents;
    });

    // Handle loading state changes
    effect(() => {
      const isCurrentlyLoading = this.isLoading();

      if (!this.noAutoScroll() && !isCurrentlyLoading && this.isUserAtBottom) {
        this.debouncedScrollToBottom(0);
      }
    });

    // Track signal content changes in the last message for auto-scroll
    effect(() => {
      if (this.noAutoScroll() || !this.isUserAtBottom) return;

      const messages = this.displayMessages();
      if (messages.length === 0) return;

      const lastMessage = messages[messages.length - 1];

      // Only track signal content for AI messages that might be streaming
      if (lastMessage.type === 'ai' && isSignal(lastMessage.content)) {
        // Access the signal value to create a dependency
        const signalValue = this.getContentValue(lastMessage.content);

        // If there's actual content, auto-scroll
        if (signalValue && typeof signalValue === 'string' && signalValue.trim().length > 0) {
          this.debouncedScrollToBottom(10);
        }
      }
    });

    // Set up ResizeObserver to handle container size changes (only in browser)
    if (isPlatformBrowser(this.platformId)) {
      effect(() => {
        const container = this.messagesContainer();
        if (container?.nativeElement && !this.noAutoScroll()) {
          this.setupResizeObserver(container.nativeElement);
        }
      });
    }
  }

  private scrollToBottom(): void {
    const container = this.messagesContainer();
    if (container?.nativeElement) {
      const element = container.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  private debouncedScrollToBottom(delay: number = 0): void {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    this.scrollTimeout = window.setTimeout(() => {
      this.scrollToBottom();
      this.scrollTimeout = undefined;
    }, delay);
  }

  private setupResizeObserver(element: HTMLElement): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    this.resizeObserver = new ResizeObserver(() => {
      if (this.isUserAtBottom && !this.noAutoScroll()) {
        this.debouncedScrollToBottom(10);
      }
    });

    this.resizeObserver.observe(element);
  }

  private checkIfUserAtBottom(): void {
    const container = this.messagesContainer();
    if (container?.nativeElement) {
      const element = container.nativeElement;
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

  protected onInterrupt(): void {
    this.interrupt.emit();
  }

  protected onFileError(error: FileUploadError): void {
    this.toastNotificationService.showToastNotification({
      state: 'warning',
      title: error.errorText,
      message: error.fileName
    });
  }

  protected getMessagePrimaryActions(message: ChatMessage): ActionBarItem[] {
    if (message.type === 'tool' || !('actions' in message) || !message.actions) return [];
    const actions = message.actions as ActionBarItem[];
    if (actions.length <= 3) {
      return actions;
    }
    return actions.slice(0, 2);
  }

  protected getMessageSecondaryActions(message: ChatMessage): MenuItemAction[] {
    if (message.type === 'tool' || !('actions' in message) || !message.actions) return [];
    const actions = message.actions as MenuItemAction[];
    if (actions.length <= 3) {
      return [];
    }
    return actions.slice(2).map(
      action =>
        ({
          ...action,
          type: 'action'
        }) as MenuItemAction
    );
  }

  protected focusInput(): void {
    const inputComponent = this.chatInput();
    if (inputComponent) {
      inputComponent.focus();
    }
  }

  /**
   * Focus the chat input
   */
  public focus(): void {
    this.focusInput();
  }

  ngAfterContentInit(): void {
    // Set up content observation for ng-content changes
    // This enables auto-scroll when projected content changes
    this.setupContentObserver();
  }

  ngOnDestroy(): void {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    if (this.contentObserver) {
      this.contentObserver.disconnect();
    }
  }

  /**
   * Sets up content observation for ng-content projections.
   * This ensures auto-scroll behavior works when projected content changes dynamically.
   * Only runs in browser environment for SSR compatibility.
   */
  private setupContentObserver(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const container = this.messagesContainer();
    if (container?.nativeElement && !this.noAutoScroll()) {
      this.contentObserver = new MutationObserver(() => {
        if (this.messages() === undefined && this.isUserAtBottom) {
          this.debouncedScrollToBottom(10);
        }
      });

      this.contentObserver.observe(container.nativeElement, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }
  }

  /**
   * Helper method to get content value from string or signal
   * If signal content is empty, automatically assumes loading state
   */
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
   * If content (or signal content) is not empty but loading is true, assume streaming (no loading state shown)
   * If global loading is true and content is empty, show loading state
   */
  protected getLoadingState(
    loading: boolean | Signal<boolean> | undefined,
    content: string | object | Signal<string | object> | undefined,
    applyGlobalLoading: boolean = false,
    allowEmptyContent: boolean = false
  ): boolean {
    const messageLoading = this.getLoadingValue(loading);
    const globalLoading = applyGlobalLoading ? this.loading() : false;
    const shouldLoad = messageLoading || globalLoading;
    const isEmptyContent = this.isEmptyContent(content);

    // If the content is empty, always show loading
    if (isEmptyContent && !allowEmptyContent) {
      return true;
    }

    // If streaming (non-empty signal content), never show loading.
    if (this.isStreamingContent(content)) {
      return false;
    }

    return shouldLoad;
  }

  protected isLatestMessage(messageId: string): boolean {
    const messages = this.messages();
    if (!messages || messages.length === 0) return false;
    return messages[messages.length - 1].id === messageId;
  }

  private isLatestToolMessage(messageId: string): boolean {
    const messages = this.messages();
    if (!messages || messages.length === 0) return false;

    // Find the index of the message
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return false;

    // If it's the last message, it's the latest
    if (messageIndex === messages.length - 1) return true;

    // If it's not second to last, it's not the latest
    if (messageIndex < messages.length - 2) return false;

    // Check if the next (actually last) message is a loading message
    const nextMessage = messages[messageIndex + 1];

    // If next message is a single AI (or loading) message that just started, count this as latest
    if (nextMessage.type === 'ai') return true;

    return false;
  }

  protected shouldAutoExpandInputArguments(message: ChatMessage): boolean {
    if (message.type !== 'tool') return false;
    if (!message.autoExpandInputArguments) {
      return false;
    }
    return this.isLatestToolMessage(message.id);
  }

  protected shouldAutoExpandOutput(message: ChatMessage): boolean {
    if (message.type !== 'tool') return false;
    if (!message.autoExpandOutput) {
      return false;
    }
    return this.isLatestToolMessage(message.id);
  }

  /**
   * Expose isSignal utility for template usage
   */
  protected readonly isSignal = isSignal;
}
