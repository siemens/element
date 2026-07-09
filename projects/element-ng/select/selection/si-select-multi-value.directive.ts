/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Directive, model } from '@angular/core';

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
  providers: [{ provide: SiSelectSelectionStrategy, useExisting: SiSelectMultiValueDirective }]
})
export class SiSelectMultiValueDirective<T> extends SiSelectSelectionStrategy<T, T[]> {
  /**
   * {@inheritDoc SiSelectSelectionStrategy#allowMultiple}
   * @defaultValue true
   */
  override readonly allowMultiple = true;

  /** @defaultValue [] */
  override readonly value = model<T[]>([]);

  protected fromArrayValue(value: T[]): T[] {
    return value;
  }

  protected toArrayValue(value: T[] | undefined): T[] {
    return value ?? [];
  }
}
