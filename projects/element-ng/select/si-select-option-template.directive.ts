/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Directive } from '@angular/core';

import { SelectOption } from './si-select.types';

/**
 * The directive allows to template/customize the option rendering in the dropdown.
 * It is also used for rendering selected values in the input if no input template is provided.
 * This requires using the {@link SiSelectSimpleOptionsDirective} to specify options as input.
 *
 * @example
 * ```html
 * <si-select [options]="[{ id: 'good', title: 'Good' }, { id: 'fair', title: 'Fair' }, { id: 'bad', title: 'Bad' }]" >
 *   <ng-template siSelectOptionTemplate let-option>{{ option.value | uppercase }}</ng-template>
 * </si-select>
 * ```
 */
@Directive({
  selector: '[siSelectOptionTemplate]'
})
export class SiSelectOptionTemplateDirective {
  /** @internal */
  static ngTemplateContextGuard<T = any>(
    directive: SiSelectOptionTemplateDirective,
    context: unknown
  ): context is { $implicit: SelectOption<T> } {
    return true;
  }
}
