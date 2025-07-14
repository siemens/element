/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Directive } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { SiSelectSelectionStrategy } from './si-select-selection-strategy';

/**
 * The directive enables the single-select behavior.
 * Otherwise, use the {@link SiSelectMultiValueDirective} directive.
 *
 * @example
 * ```html
 * <si-select [(value)]="selectedValue" [options]="[
 *  { id: 'good', title: 'Good' },
 *  { id: 'average', title: 'Average' },
 *  { id: 'poor', title: 'Poor' }
 * ]"></si-select>
 * ```
 */
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'si-select:not([multi])',
  providers: [
    { provide: SiSelectSelectionStrategy, useExisting: SiSelectSingleValueDirective },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SiSelectSingleValueDirective,
      multi: true
    }
  ]
})
export class SiSelectSingleValueDirective<T> extends SiSelectSelectionStrategy<T, T> {
  /**
   * {@inheritDoc SiSelectSelectionStrategy#allowMultiple}
   * @defaultValue false
   */
  override allowMultiple = false;

  protected toArrayValue(value: T | undefined): readonly T[] {
    return value !== undefined ? [value] : [];
  }

  protected fromArrayValue([value]: readonly T[]): T {
    return value;
  }
}
