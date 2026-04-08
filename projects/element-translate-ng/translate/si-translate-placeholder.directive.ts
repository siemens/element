/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Directive, inject, input, TemplateRef } from '@angular/core';

/**
 * Marker directive to provide templates as named parameters by {@link SiTranslateTemplateComponent}.
 *
 * Each template maps to a `{{placeholder}}` in the translation string. The directive's alias
 * value must match the placeholder name exactly.
 *
 * @example
 * ```html
 * <span siTranslateTemplate key="startsIn">
 *   <ng-template siTranslatePlaceholder="start-time">
 *     <time [attr.datetime]="startTime">{{ formatTime(startTime) }}</time>
 *   </ng-template>
 * </span>
 * ```
 *
 * With translation: `{ "startsIn": "Event begins {{start-time}}" }`
 *
 * @experimental
 * @internal
 */
@Directive({
  selector: '[siTranslatePlaceholder]'
})
export class SiTranslatePlaceholderDirective {
  /** The placeholder name this template maps to. */
  readonly name = input.required<string>({ alias: 'siTranslatePlaceholder' });
  /** @internal */
  readonly template = inject(TemplateRef<unknown>);
}
