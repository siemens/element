/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Directive } from '@angular/core';

import { SelectOption } from './si-select.types';

/**
 * The directive allows to template/customize the selected value rendering in the select input.
 * This requires using the {@link SiSelectSimpleOptionsDirective} to specify options as input.
 *
 * @example
 * ```html
 * <si-select [options]="[
 *   { type: 'option', value: 'good', label: 'Good' },
 *   { type: 'option', value: 'fair', label: 'Fair' }
 * ]">
 *   <ng-template siSelectValueTemplate let-option>{{ option.label }}</ng-template>
 * </si-select>
 * ```
 */
@Directive({
  selector: '[siSelectValueTemplate]'
})
export class SiSelectValueTemplateDirective {
  /** @internal */
  static ngTemplateContextGuard<T = any>(
    directive: SiSelectValueTemplateDirective,
    context: unknown
  ): context is { $implicit: SelectOption<T> } {
    return true;
  }
}
