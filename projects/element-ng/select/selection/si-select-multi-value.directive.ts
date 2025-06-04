/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Directive } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { SiSelectSelectionStrategy } from './si-select-selection-strategy';

/**
 * The directive enables the multi-select behavior.
 * Otherwise, use the {@link SiSelectSingleValueDirective} directive.
 *
 * @example
 * ```html
 * <si-select multi [(value)]="multiValue" [options]="[
 *  { id: 'good', title: 'Good' },
 *  { id: 'average', title: 'Average' },
 *  { id: 'poor', title: 'Poor' }
 * ]"></si-select>
 * ```
 */
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'si-select[multi]',
  providers: [
    { provide: SiSelectSelectionStrategy, useExisting: SiSelectMultiValueDirective },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SiSelectMultiValueDirective,
      multi: true
    }
  ]
})
export class SiSelectMultiValueDirective<T> extends SiSelectSelectionStrategy<T, T[]> {
  /**
   * {@inheritDoc SiSelectSelectionStrategy#allowMultiple}
   * @defaultValue true
   */
  override readonly allowMultiple = true;

  protected fromArrayValue(value: T[]): T[] {
    return value;
  }

  protected toArrayValue(value: T[] | undefined): T[] {
    return value ?? [];
  }
}
