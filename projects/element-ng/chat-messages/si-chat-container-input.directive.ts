/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Directive } from '@angular/core';

/**
 * A directive to mark elements as input controls within a {@link SiChatContainerComponent}.
 *
 * This directive is used to identify and style input elements that belong to
 * the chat container component, typically applied to form inputs or textareas
 * used for composing chat messages.
 *
 * @example
 * ```html
 * <si-chat-container>
 *   <si-chat-message>Hello!</si-chat-message>
 *   <si-chat-message>How are you?</si-chat-message>
 *
 *   <input siChatContainerInput type="text" placeholder="Type a message..." />
 * </si-chat-container>
 * ```
 *
 * @see {@link SiChatContainerComponent} for the chat container wrapper component
 *
 * @experimental
 */
@Directive({
  selector: '[siChatContainerInput]'
})
export class SiChatContainerInputDirective {}
