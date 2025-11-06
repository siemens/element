/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import type { Signal, TemplateRef } from '@angular/core';
import type { TranslatableString } from '@siemens/element-translate-ng/translate-types';

/**
 * Actions for messages representing an action with icon, label (for accessibility), and handler.
 * Only the icon will be displayed.
 *
 * @see {@link SiUserMessageComponent} for the user message where this is used
 * @see {@link SiAiMessageComponent} for the AI message where this is used
 * @see {@link SiAiChatContainerComponent} for the AI chat container where these actions are used
 *
 * @experimental
 */
export interface MessageAction {
  /** Label that is shown to the user. */
  label: TranslatableString;
  /**
   * Icon used to represent the action
   */
  icon: string;
  /**
   * Action that is called when the item is triggered.
   */
  action: (actionParam: any, source: this) => void;
  /** Whether the menu item is disabled. */
  disabled?: boolean;
}

/**
 * Attachment item interface for file attachments in chat messages, used by {@link SiAttachmentListComponent} and inside {@link SiUserMessageComponent} as well as {@link SiChatInputComponent}.
 *
 * @see {@link SiAttachmentListComponent} for the attachment list component
 * @see {@link SiUserMessageComponent} for the user message
 * @see {@link SiChatInputComponent} for the chat input component
 *
 * @experimental
 */
export interface Attachment {
  /** File name */
  name: string;
  /** Optionally show a preview of the attachment by providing a template that is shown in a modal when clicked (optional) */
  previewTemplate?: TemplateRef<any> | (() => TemplateRef<any>);
}

/**
 * Base interface for all chat messages. Messages can be rendered either with content
 * or with a custom template for advanced styling and functionality.
 *
 * @see {@link ChatMessage} for the chat message type union
 * @see {@link UserChatMessage} for user messages
 * @see {@link AiChatMessage} for AI chat messages
 * @see {@link ToolChatMessage} for tool messages
 * @see {@link TemplateChatMessage} for template-based messages
 *
 * @experimental
 */
export interface BaseChatMessage {
  /** Type of message */
  type: 'user' | 'ai' | 'tool';
  /** Message content - can be a string or a Signal<string>, empty string shows loading state */
  content?: string | Signal<string>;
  /** Whether the message is currently loading/being generated - can be a boolean or Signal<boolean> */
  loading?: boolean | Signal<boolean>;
}

/**
 * User chat message for AI chats
 *
 * @see {@link SiAiChatContainerComponent} for the AI chat container where this is used
 *
 * @experimental
 */
export interface UserChatMessage extends BaseChatMessage {
  /** Type of message */
  type: 'user';
  /** Message content, should be a string, empty string shows loading state */
  content: string;
  /** Attachments (for user messages) */
  attachments?: Attachment[];
  /** Actions available for this message */
  actions?: MessageAction[];
}

/**
 * AI chat message
 *
 * @see {@link SiAiChatContainerComponent} for the AI chat container where this is used
 *
 * @experimental
 */
export interface AiChatMessage extends BaseChatMessage {
  /** Type of message */
  type: 'ai';
  /** Message content - can be a string or a Signal<string>, empty string shows loading state, set signal back to string to end "streaming" state */
  content: string | Signal<string>;
  /** Actions available for this message */
  actions?: MessageAction[];
}

/** AI tool call display
 *
 * @see {@link SiAiChatContainerComponent} for the AI chat container where this is used
 *
 * @experimental
 */
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

/**
 * Render custom chat message via template, consider using {@link SiChatMessageComponent} inside the template for consistent styling
 *
 * @see {@link SiAiChatContainerComponent} for the AI chat container where this is used
 * @see {@link SiChatMessageComponent} for the chat message wrapper component which can be used inside the template
 *
 * @experimental
 */
export interface TemplateChatMessage {
  /**
   * Template to render the message
   */
  template: TemplateRef<any>;

  /** Context data to pass to the template */
  templateContext?: any;
}

/**
 * Chat message type union of all supported message types in the AI chat container.
 *
 * @see {@link UserChatMessage} for user messages
 * @see {@link AiChatMessage} for AI messages
 * @see {@link ToolChatMessage} for AI tool calls
 * @see {@link TemplateChatMessage} for template-based messages
 * @see {@link BaseChatMessage} for the base chat message interface
 * @see {@link SiAiChatContainerComponent} for the AI chat container where this is used
 *
 * @experimental
 */
export type ChatMessage = UserChatMessage | AiChatMessage | ToolChatMessage | TemplateChatMessage;
