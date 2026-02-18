/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Directive } from '@angular/core';

/**
 * Directive to mark content as chat input disclaimer into {@link SiChatInputComponent}.
 * Apply this directive to content that should be slotted into the disclaimer area.
 *
 * @example
 * ```html
 * <si-chat-input>
 *   <div siChatInputDisclaimer>
 *     Custom disclaimer content
 *   </div>
 * </si-chat-input>
 * ```
 *
 * @see {@link SiChatInputComponent} for the chat input wrapper component
 *
 * @experimental
 */
@Directive({
  selector: '[siChatInputDisclaimer]'
})
export class SiChatInputDisclaimerDirective {}
