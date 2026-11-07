/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  input,
  output,
  booleanAttribute,
  contentChild,
  Signal,
  isSignal,
  effect,
  viewChild,
  signal
} from '@angular/core';
import { BackgroundColorVariant } from '@siemens/element-ng/common';
import { SiInlineNotificationComponent } from '@siemens/element-ng/inline-notification';
import {
  makeSiMarkdownOptions,
  SiMarkdownComponent,
  SiMarkdownOptions
} from '@siemens/element-ng/markdown';
import { MenuItem } from '@siemens/element-ng/menu';
import { SiTranslatePipe, TranslatableString, t } from '@siemens/element-translate-ng/translate';

import {
  ActivityChatMessage,
  ActivityDetailsDisplay,
  ActivityTraceChatMessage,
  AiChatMessage,
  ChatMessage,
  TemplateChatMessage
} from './chat-message.model';
import { MessageAction } from './message-action.model';
import { SiActivityMessagePartComponent } from './si-activity-message-part.component';
import { SiActivityMessageComponent } from './si-activity-message.component';
import { SiActivityTraceComponent } from './si-activity-trace.component';
import { SiAiMessageComponent } from './si-ai-message.component';
import { PromptSuggestion, SiAiWelcomeScreenComponent } from './si-ai-welcome-screen.component';
import { SiChatContainerInputDirective } from './si-chat-container-input.directive';
import { SiChatContainerComponent } from './si-chat-container.component';
import { ChatInputAttachment, SiChatInputComponent } from './si-chat-input.component';
import { SiUserMessageComponent } from './si-user-message.component';

interface ActivityInputPart {
  content?: string;
  heading: TranslatableString;
  key?: string;
}

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
    SiInlineNotificationComponent,
    SiAiMessageComponent,
    SiActivityMessageComponent,
    SiActivityMessagePartComponent,
    SiActivityTraceComponent,
    SiUserMessageComponent,
    SiMarkdownComponent,
    SiChatContainerComponent,
    SiChatContainerInputDirective,
    SiTranslatePipe,
    SiAiWelcomeScreenComponent
  ],
  templateUrl: './si-ai-chat-container.component.html',
  host: {
    class: 'd-flex si-layout-inner flex-grow-1 flex-column h-100 w-100'
  }
})
export class SiAiChatContainerComponent {
  private readonly chatInput = contentChild<SiChatInputComponent>(SiChatInputComponent);
  private readonly chatContainer = viewChild<SiChatContainerComponent>(SiChatContainerComponent);

  constructor() {
    effect(() => {
      const inputComponent = this.chatInput();
      if (inputComponent) {
        inputComponent.registerParent(this.inputSending, this.inputInterruptible, () => {
          this.scrollToBottom();
        });
      }
    });

    effect(() => {
      if (this.isEmpty()) {
        this.chatContainer()?.scrollToTop();
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
   * Whether the latest activity details are expanded automatically.
   * @defaultValue true
   */
  readonly autoExpand = input(true, { transform: booleanAttribute });

  /**
   * Which activity input and output parts are shown.
   * @defaultValue 'auto'
   */
  readonly show = input<ActivityDetailsDisplay>('auto');

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
   * Options used to render chat message markdown.
   * @defaultValue
   * ```
   * makeSiMarkdownOptions()
   * ```
   */
  readonly markdownOptions = input<SiMarkdownOptions>(makeSiMarkdownOptions());

  /**
   * The greeting text for the welcome screen
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_AI_CHAT_CONTAINER.WELCOME_GREETING:Hello,`)
   * ```
   */
  readonly greeting = input(t(() => $localize`:@@SI_AI_CHAT_CONTAINER.WELCOME_GREETING:Hello,`));

  /**
   * The welcome message text for the welcome screen
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_AI_CHAT_CONTAINER.WELCOME_MESSAGE:how can I help you today?`)
   * ```
   */
  readonly welcomeMessage = input(
    t(() => $localize`:@@SI_AI_CHAT_CONTAINER.WELCOME_MESSAGE:how can I help you today?`)
  );

  /**
   * The list of prompt suggestions for the welcome screen, either as an array or a record mapping category labels to suggestion arrays
   * @defaultValue []
   */
  readonly promptSuggestions = input<PromptSuggestion[] | Record<string, PromptSuggestion[]>>([]);

  /**
   * Internal selected category state
   */
  protected readonly selectedCategory = signal<string | undefined>(undefined);

  /**
   * Computed list of categories derived from promptSuggestions
   */
  protected readonly promptCategories = computed(() => {
    const suggestions = this.promptSuggestions();
    if (Array.isArray(suggestions)) {
      return [];
    }
    return Object.keys(suggestions).map(label => ({ label }));
  });

  /**
   * Resolved prompt suggestions based on selected category.
   */
  protected readonly resolvedPromptSuggestions = computed<PromptSuggestion[]>(() => {
    const suggestions = this.promptSuggestions();
    if (Array.isArray(suggestions)) {
      return suggestions;
    }
    const category = this.selectedCategory();
    if (category && suggestions[category]) {
      return suggestions[category];
    }
    const keys = Object.keys(suggestions);
    return keys.length > 0 ? suggestions[keys[0]] : [];
  });

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
   * Label for activity input arguments.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_AI_CHAT_CONTAINER.INPUT_ARGUMENTS:Input arguments`)
   * ```
   */
  readonly activityInputArgumentsLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_AI_CHAT_CONTAINER.INPUT_ARGUMENTS:Input arguments`)
  );

  /**
   * Label for activity output.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_AI_CHAT_CONTAINER.OUTPUT:Output`)
   * ```
   */
  readonly activityOutputLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_AI_CHAT_CONTAINER.OUTPUT:Output`)
  );

  /**
   * Default name for reasoning activities.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_AI_CHAT_CONTAINER.REASONING:Reasoning`)
   * ```
   */
  readonly activityReasoningLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_AI_CHAT_CONTAINER.REASONING:Reasoning`)
  );

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
        latestMessage.type === 'user' ||
        latestMessage.type === 'activity' ||
        latestMessage.type === 'activity-trace';

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
    if (
      this.isTemplateMessage(message) ||
      message.type === 'activity' ||
      message.type === 'activity-trace'
    ) {
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

  protected getContentValue(content: string | Signal<string> | undefined): string {
    if (isSignal(content)) {
      return content();
    }
    return content ?? '';
  }

  protected getMarkdownContent(
    content: string | object | Signal<string | object> | undefined
  ): string {
    const value = isSignal(content) ? content() : content;
    if (typeof value === 'string') {
      return value;
    }
    return value ? `\`\`\`json\n${JSON.stringify(value, undefined, 2)}\n\`\`\`` : '';
  }

  private isEmptyContent(content: string | Signal<string> | undefined): boolean {
    const contentValue = this.getContentValue(content);
    return !contentValue || contentValue.trim().length === 0;
  }

  protected getLoadingValue(loading: boolean | Signal<boolean> | undefined): boolean {
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

  protected isLatestActivityMessage(
    message: ActivityChatMessage | ActivityTraceChatMessage
  ): boolean {
    const messages = this.displayMessages();
    const messageIndex = messages.indexOf(message);
    if (messageIndex === -1) {
      return false;
    }

    return !messages.slice(messageIndex + 1).some(next => {
      return (
        !this.isTemplateMessage(next) &&
        (next.type === 'activity' || next.type === 'activity-trace' || next.type === 'user')
      );
    });
  }

  protected shouldAutoExpandTrace(message: ActivityTraceChatMessage): boolean {
    return (
      this.isLatestActivityMessage(message) &&
      ((message.autoExpand ?? this.autoExpand()) ||
        message.messages.some(activity => this.hasExplicitAutoExpand(activity)))
    );
  }

  protected shouldAutoExpandActivity(
    message: ActivityChatMessage,
    active: boolean,
    inheritedAutoExpand: boolean
  ): boolean {
    return (
      active && ((message.autoExpand ?? inheritedAutoExpand) || this.hasExplicitAutoExpand(message))
    );
  }

  private hasExplicitAutoExpand(message: ActivityChatMessage): boolean {
    return (
      message.autoExpandInputs === true ||
      (Array.isArray(message.autoExpandInputs) && message.autoExpandInputs.length > 0) ||
      message.autoExpandOutputs === true ||
      !!message.messages?.some(activity =>
        activity.autoExpand === true ? true : this.hasExplicitAutoExpand(activity)
      )
    );
  }

  protected hasActivityDetails(message: ActivityChatMessage): boolean {
    return (
      !!this.getContentValue(message.content).trim() ||
      this.shouldShowActivityInputs(message) ||
      this.shouldShowActivityOutput(message) ||
      !!message.messages?.length
    );
  }

  protected getActivityInputs(message: ActivityChatMessage): ActivityInputPart[] {
    if (typeof message.input === 'string') {
      return [
        {
          heading: message.inputArgumentsLabel ?? this.activityInputArgumentsLabel(),
          content: message.input
        }
      ];
    }
    if (Array.isArray(message.input)) {
      return message.input.map((heading, index) => ({ heading, key: `${index}` }));
    }
    if (message.input) {
      return Object.entries(message.input).map(([key, content]) => ({
        heading: key,
        content,
        key
      }));
    }
    return [];
  }

  protected hasActivityOutput(message: ActivityChatMessage): boolean {
    return !!message.output?.trim();
  }

  protected shouldShowActivityInputs(message: ActivityChatMessage): boolean {
    const show = this.show();
    return (
      this.getActivityInputs(message).length > 0 &&
      (show === 'inputs' ||
        show === 'both' ||
        (show === 'auto' && !this.hasActivityOutput(message)))
    );
  }

  protected shouldShowActivityOutput(message: ActivityChatMessage): boolean {
    const show = this.show();
    return (
      this.hasActivityOutput(message) && (show === 'outputs' || show === 'both' || show === 'auto')
    );
  }

  protected shouldAutoExpandInput(
    message: ActivityChatMessage,
    inputPart: ActivityInputPart,
    active: boolean,
    inheritedAutoExpand: boolean
  ): boolean {
    if (!active || inputPart.content === undefined) {
      return false;
    }

    if (Array.isArray(message.autoExpandInputs)) {
      return inputPart.key !== undefined && message.autoExpandInputs.includes(inputPart.key);
    }
    if (message.autoExpandInputs !== undefined) {
      return message.autoExpandInputs;
    }
    if (this.shouldShowActivityOutput(message)) {
      return false;
    }
    return message.autoExpand ?? inheritedAutoExpand;
  }

  protected shouldAutoExpandOutput(
    message: ActivityChatMessage,
    active: boolean,
    inheritedAutoExpand: boolean
  ): boolean {
    return active && (message.autoExpandOutputs ?? message.autoExpand ?? inheritedAutoExpand);
  }

  protected readonly isSignal = isSignal;

  protected onPromptSelected(suggestion: PromptSuggestion): void {
    // Set the input value and emit the send event
    const inputComponent = this.chatInput();
    if (inputComponent) {
      inputComponent.value.set(suggestion.text);
      // Programmatically trigger the send output
      inputComponent.send.emit({
        content: suggestion.text,
        attachments: []
      });
      inputComponent.value.set('');
    }
  }
}
