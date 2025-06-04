/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { computed, Directive, input, OnChanges } from '@angular/core';

import { SelectItem, SelectOption, SelectOptionLegacy } from '../si-select.types';
import { SI_SELECT_OPTIONS_STRATEGY } from './si-select-options-strategy';
import { SiSelectOptionsStrategyBase } from './si-select-options-strategy.base';

/**
 * This directive allows passing {@link SelectItem} to the {@link SiSelectComponent}.
 *
 * @example
 * ```html
 * <si-select [options]="[{ type: 'option', value: 'one', label: 'One' }, { type: 'option', value: 'two', label: 'Two' }]"></si-select>
 * <si-select [options]="[{ type: 'group', label: 'Group', options [{ type: 'option', value: 1, label: 'One' }, { type: 'option', value: 2, label: 'Two' }] }]"></si-select>
 * ```
 */
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'si-select[options]',
  providers: [{ provide: SI_SELECT_OPTIONS_STRATEGY, useExisting: SiSelectSimpleOptionsDirective }]
})
export class SiSelectSimpleOptionsDirective<T = string>
  extends SiSelectOptionsStrategyBase<T>
  implements OnChanges
{
  /** Options to be shown in select dropdown */
  readonly options = input<(SelectOptionLegacy | SelectItem<T>)[] | null>();

  /**
   * By default, values are check on referential equality. Provide a function to customize the behavior.
   *
   * @defaultValue
   * ```
   * (a: T, b: T): boolean => a === b
   * ```
   */
  override readonly optionsEqual = input((a: T, b: T): boolean => a === b, {
    // eslint-disable-next-line @angular-eslint/no-input-rename
    alias: 'optionEqualCheckFn'
  });

  override readonly allRows = computed(() => {
    const options = this.options();
    if (options) {
      return options?.map(option =>
        option.type
          ? option
          : ({
              type: 'option',
              value: option.id as T,
              label: option.title,
              iconColor: option.color,
              icon: option.icon,
              disabled: option.disabled
            } as SelectOption<T>)
      );
    } else {
      return [];
    }
  });

  ngOnChanges(): void {
    this.onFilter();
  }
}
