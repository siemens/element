/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * Directive to mark custom body content for {@link SiChatMessageComponent}.
 *
 * Apply this directive to an `ng-template` to render arbitrary Angular content
 * inside the message bubble.
 *
 * @example
 * ```html
 * <si-chat-message>
 *   <ng-template siChatMessageBody>
 *     <p>Custom message body</p>
 *   </ng-template>
 * </si-chat-message>
 * ```
 *
 * @experimental
 */
@Directive({
  selector: 'ng-template[siChatMessageBody]'
})
export class SiChatMessageBodyDirective {
  readonly templateRef = inject(TemplateRef<unknown>);
}
