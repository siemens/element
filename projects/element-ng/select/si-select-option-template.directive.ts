/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Directive } from '@angular/core';

import { SelectOption } from './si-select.types';

/**
 * The directive allows to template/customize the value option rendering.
 * This requires using the {@link SiSelectComplexOptionsDirective} to specify complex options as input.
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
