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
  PLATFORM_ID
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
  /** Message content */
  content?: string;
  /** Whether the message is currently loading/being generated */
  loading?: boolean;
  /**
   * Optional template to render instead of content. When provided, the content
   * property (as well as any actions or attachments) will be ignored.
   */
  template?: TemplateRef<any>;
}

export interface UserChatMessage extends BaseChatMessage {
  /** Type of message */
  type: 'user';
  /** Message content */
  content: string;
  /** Attachments (for user messages) */
  attachments?: AttachmentItem[];
  /** Actions available for this message */
  actions?: MenuItemAction[];
}

export interface AiChatMessage extends BaseChatMessage {
  /** Type of message */
  type: 'ai';
  /** Message content */
  content: string;
  /** Actions available for this message */
  actions?: ActionBarItem[];
}

export interface ToolChatMessage extends BaseChatMessage {
  /** Type of message */
  type: 'tool';
  /** Tool name/title */
  name: string;
  /** Input arguments for the tool call */
  inputArguments?: string | object;
  /** Output result from the tool call */
  output?: string | object;
}

export interface TemplateChatMessage extends BaseChatMessage {
  /** Type of message */
  template: TemplateRef<any>;
}

export type ChatMessage = UserChatMessage | AiChatMessage | ToolChatMessage;

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
    class: 'd-flex si-layout-inner flex-grow-1 h-100 w-100',
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
   * t(() => $localize`:@@SI_CHAT_INPUT.PLACEHOLDER:Type a message...`)
   * ```
   */
  readonly inputPlaceholder = input<TranslatableString>(
    t(() => $localize`:@@SI_CHAT_INPUT.PLACEHOLDER:Type a message...`)
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
   * Aria label for user message actions button
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_ACTION_BAR.DROPDOWN_ACTIONS:Show actions`)
   * ```
   */
  readonly userMessageActionsLabel = input(
    t(() => $localize`:@@SI_ACTION_BAR.DROPDOWN_ACTIONS:Show actions`)
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

  protected readonly isEmpty = computed(() => this.messages()?.length === 0);

  protected readonly isLoading = computed(
    () => this.loading || this.messages()?.some(message => message.loading) || this.sending()
  );

  protected readonly displayMessages = computed(() => {
    const messages = this.messages();
    if (!messages) {
      return [];
    }
    if (this.loading()) {
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
          icon: action.icon
        }) as MenuItemAction
    );
  });

  constructor() {
    // Track messages and auto-scroll when new messages are added or existing ones update
    effect(() => {
      const currentMessages = this.displayMessages();
      const currentCount = currentMessages.length;
      const currentContents = currentMessages.map(
        msg => msg.content + '|' + msg.loading + '|' + (msg.template ? 'template' : 'content')
      );

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

  protected onFileError(error: FileUploadError): void {
    this.toastNotificationService.showToastNotification({
      state: 'warning',
      title: error.errorText,
      message: error.fileName
    });
  }

  protected trackByMessageId(index: number, message: ChatMessage): string {
    return message.id;
  }

  protected getAiMessagePrimaryActions(message: ChatMessage): ActionBarItem[] {
    if (message.type !== 'ai' || !('actions' in message) || !message.actions) return [];
    const aiActions = message.actions as ActionBarItem[];
    if (aiActions.length <= 3) {
      return aiActions;
    }
    return aiActions.slice(0, 2);
  }

  protected getAiMessageSecondaryActions(message: ChatMessage): MenuItemAction[] {
    if (message.type !== 'ai' || !('actions' in message) || !message.actions) return [];
    const aiActions = message.actions as MenuItemAction[];
    if (aiActions.length <= 3) {
      return [];
    }
    return aiActions.slice(2);
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
}
