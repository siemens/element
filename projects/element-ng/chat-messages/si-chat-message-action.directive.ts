/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Directive } from '@angular/core';

/**
 * Directive to mark content as chat message actions.
 * Apply this directive to e.g. buttons that should be slotted into the message actions area.
 *
 * @experimental
 * @example
 * ```html
 * <si-chat-message>
 *   Message content
 *   <button siChatMessageAction>Like</button>
 *   <button siChatMessageAction>Share</button>
 * </si-chat-message>
 * ```
 */
@Directive({
  selector: '[siChatMessageAction]'
})
export class SiChatMessageActionDirective {}
