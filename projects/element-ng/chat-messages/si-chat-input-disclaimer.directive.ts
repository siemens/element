/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Directive } from '@angular/core';

/**
 * Directive to mark content as chat input disclaimer.
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
 */
@Directive({
  selector: '[siChatInputDisclaimer]'
})
export class SiChatInputDisclaimerDirective {}
