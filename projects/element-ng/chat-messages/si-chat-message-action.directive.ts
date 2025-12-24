/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Directive } from '@angular/core';

/**
 * Directive to mark content as chat message actions into {@link SiChatMessageComponent}.
 * Apply this directive to e.g. buttons that should be slotted into the message actions area.
 *
 * @example
 * ```html
 * <si-chat-message>
 *   Message content
 *   <button siChatMessageAction>Like</button>
 *   <button siChatMessageAction>Share</button>
 * </si-chat-message>
 * ```
 *
 * @see {@link SiChatMessageComponent} for the chat message wrapper component
 *
 * @experimental
 */
@Directive({
  selector: '[siChatMessageAction]'
})
export class SiChatMessageActionDirective {}
