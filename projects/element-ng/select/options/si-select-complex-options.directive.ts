/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { computed, Directive, input, OnChanges } from '@angular/core';
import { buildTrackByIdentity } from '@spike-rabbit/element-ng/common';

import { SelectGroup, SelectOption } from '../si-select.types';
import { SI_SELECT_OPTIONS_STRATEGY } from './si-select-options-strategy';
import { SiSelectOptionsStrategyBase } from './si-select-options-strategy.base';

/**
 * The directive allows passing custom options.
 * Otherwise, use the {@link SiSelectSimpleOptionsDirective} directive.
 *
 * @deprecated Use {@link SiSelectSimpleOptionsDirective} instead.
 *
 * @example
 * ```html
 * <si-select [complexOptions]="['v1', 'v2', 'v3']"></si-select>
 * <si-select [complexOptions]="{ g1: ['g1.i1', 'g1.i2'], g2: ['g2.i1']}"></si-select>
 * ```
 */
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'si-select[complexOptions]',
  providers: [{ provide: SI_SELECT_OPTIONS_STRATEGY, useExisting: SiSelectComplexOptionsDirective }]
})
export class SiSelectComplexOptionsDirective<T>
  extends SiSelectOptionsStrategyBase<T>
  implements OnChanges
{
  /** Options to be shown in select dropdown. */
  readonly complexOptions = input<T[] | Record<string, T[]> | null>();

  /**
   * @deprecated Property has no effect and can be removed.
   *
   * @defaultValue
   * ```
   * buildTrackByIdentity<T>()
   * ```
   */
  readonly trackBy = input(buildTrackByIdentity<T>());

  /**
   * By default, values are check on equality by reference. Override to customize the behavior.
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

  /**
   * The valueProvider is used to extract the display text of a value.
   */
  readonly valueProvider = input<(dropdownOption: T) => string | undefined>();

  /**
   * Provides Value for the display text of the dropdown group
   *
   * @defaultValue
   * ```
   * () => undefined
   * ```
   */
  readonly groupProvider = input<(groupKey: string) => string | undefined>(() => undefined);

  /**
   * The disabledProvider is used to display menu items as disabled.
   *
   * @defaultValue
   * ```
   * () => false
   * ```
   */
  readonly disabledProvider = input<(dropdownOption: T) => boolean>(() => false);

  override readonly allRows = computed(() => {
    const complexOptions = this.complexOptions();
    if (complexOptions instanceof Array) {
      return this.convertOptionsArray(complexOptions);
    } else if (complexOptions) {
      const groupProvider = this.groupProvider();
      return Object.entries(complexOptions).map(
        ([key, value]) =>
          ({
            type: 'group',
            key,
            label: groupProvider(key) ?? key,
            options: this.convertOptionsArray(value)
          }) as SelectGroup<T>
      );
    } else {
      return [];
    }
  });

  ngOnChanges(): void {
    this.onFilter();
  }

  private convertOptionsArray(options: T[]): SelectOption<T>[] {
    const provide = this.valueProvider();
    return options.map(option => {
      return {
        type: 'option',
        value: option,
        label: (provide ? provide(option) : undefined) ?? option + '',
        typeaheadLabel: provide ? provide(option) : undefined,
        disabled: this.disabledProvider()(option)
      };
    });
  }
}
