/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import type { Signal, TemplateRef } from '@angular/core';
import type { TranslatableString } from '@siemens/element-translate-ng/translate-types';

import type { MessageAction } from './message-action.model';
import type { Attachment } from './si-attachment-list.component';

export type ActivityDetailsDisplay = 'auto' | 'inputs' | 'outputs' | 'both';

/**
 * Base interface for all chat messages. Messages can be rendered either with content
 * or with a custom template for advanced styling and functionality.
 *
 * @see {@link ChatMessage} for the chat message type union
 * @see {@link UserChatMessage} for user messages
 * @see {@link AiChatMessage} for AI messages
 * @see {@link TemplateChatMessage} for template-based messages
 *
 * @experimental
 */
export interface BaseChatMessage {
  /** Type of message */
  type: 'user' | 'ai';
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

/** Progress or intermediate activity shown between chat messages. */
export interface ActivityChatMessage {
  type: 'activity';
  /** Activity name. Defaults to the reasoning label for content-only activities. */
  name?: TranslatableString;
  /** Activity inputs. Record entries are rendered as individual message parts. */
  input?: string | string[] | Record<string, string>;
  /** Label for the input arguments section. */
  inputArgumentsLabel?: TranslatableString;
  /** Output from the activity. */
  output?: string;
  /** Label for the output section. */
  outputLabel?: TranslatableString;
  /** Reasoning content rendered directly in the activity. */
  content?: string | Signal<string>;
  /** Whether the activity is still running. */
  loading?: boolean | Signal<boolean>;
  /** Alternative icon. Set to false to show the generic activity marker. */
  icon?: string | false;
  /** Nested activities. */
  messages?: ActivityChatMessage[];
  /** Overrides automatic expansion for this activity. */
  autoExpand?: boolean;
  /** Overrides automatic input expansion. Record keys can be selected individually. */
  autoExpandInputs?: boolean | string[];
  /** Overrides automatic output expansion. */
  autoExpandOutputs?: boolean;
}

/**
 * Related activities grouped under a shared collapsible heading.
 * The latest trace stays expanded until a user message follows it.
 */
export interface ActivityTraceChatMessage {
  type: 'activity-trace';
  /** Activity trace name. */
  name: TranslatableString;
  /** Activities in execution order. */
  messages: ActivityChatMessage[];
  /** Overrides automatic expansion for this trace. */
  autoExpand?: boolean;
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
 * @see {@link ActivityChatMessage} for individual activities
 * @see {@link ActivityTraceChatMessage} for grouped activities
 * @see {@link TemplateChatMessage} for template-based messages
 * @see {@link BaseChatMessage} for the base chat message interface
 * @see {@link SiAiChatContainerComponent} for the AI chat container where this is used
 *
 * @experimental
 */
export type ChatMessage =
  | UserChatMessage
  | AiChatMessage
  | ActivityChatMessage
  | ActivityTraceChatMessage
  | TemplateChatMessage;
