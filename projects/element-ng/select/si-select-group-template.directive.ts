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
 * <si-select [options]="[
 *   { type: 'group', key: 'g1', label: 'Group 1', options: [
 *     { type: 'option', value: 'g1.i1', label: 'Item 1' },
 *     { type: 'option', value: 'g1.i2', label: 'Item 2' }
 *   ]},
 *   { type: 'group', key: 'g2', label: 'Group 2', options: [
 *     { type: 'option', value: 'g2.i1', label: 'Item 1' }
 *   ]}
 * ]">
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
