/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Directive } from '@angular/core';

import { SelectGroup } from './si-select.types';

/**
 * The directive allows to template/customize the group option rendering.
 * This requires using the {@link SiSelectSimpleOptionsDirective} to specify options as input.
 *
 * @example
 * ```html
 * <si-select [options]="{ g1: ['g1.i1', 'g1.i2'], g2: ['g2.i1'] }" >
 *   <ng-template siSelectGroupTemplate let-group>{{ group.key | uppercase }}</ng-template>
 * </si-select>
 * ```
 */
@Directive({
  selector: '[siSelectGroupTemplate]'
})
export class SiSelectGroupTemplateDirective {
  static ngTemplateContextGuard<T = any>(
    directive: SiSelectGroupTemplateDirective,
    context: unknown
  ): context is { $implicit: SelectGroup<T> } {
    return true;
  }
}
