/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Directive } from '@angular/core';

/**
 * Marker directive for projecting content into the actions row of {@link SiAiMessageComponent}.
 * Apply this to elements that should appear alongside the standard action buttons.
 *
 * @example
 * ```html
 * <si-ai-message [content]="...">
 *   <si-summary-chip siAiMessageAction label="Sources" [siPopover]="sourcesTpl" />
 * </si-ai-message>
 * ```
 *
 * @see {@link SiAiMessageComponent}
 */
@Directive({ selector: '[siAiMessageAction]' })
export class SiAiMessageActionDirective {}
