/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Observable } from 'rxjs';

import type { SiSelectComponent } from '../si-select.component';
import { SelectItem, SelectOption } from '../si-select.types';

/**
 * An interface to define a lazy option source for the {@link SiSelectComponent}.
 *
 * @typeParam TValue - is the type of the value in {@link SiSelectComponent}, so the value of the associated formControl, ngModel or value input.
 */
export interface SelectOptionSource<TValue> {
  /**
   * Get options for the provided values.
   * This is basically a resolver function, that resolves values to options.
   *
   * @param values - values that should be resolved to an option.
   */
  getOptionsForValues(values: TValue[]): Observable<SelectOption<TValue>[]>;

  /**
   * Get all available options.
   * If provided, this will be called when no filter value is provided.
   * Otherwise, si-select will only show the selected values.

   * This function must be implemented if this source is used on a select without a filter.
   */
  getAllOptions?(): Observable<SelectItem<TValue>[]>;

  /**
   * Find options for a search value. It will never be called with an empty search value.
   *
   * This function must be implemented if this source is used on a si-select with a filter.
   *
   * @param search - value typed by the user in the search field.
   */
  getOptionsForSearch?(search: string): Observable<SelectItem<TValue>[]>;

  /**
   * This function is used to sort options.
   *
   * It is only called if the si-select was able to find all options without querying the option source.
   */
  compareOptions?(a: SelectOption<TValue>, b: SelectOption<TValue>): number;

  /**
   * Function to check if two values are equal.
   *
   * This function must be implemented if the check on reference equality is not enough.
   * For instance, when using objects as value.
   */
  valuesEqual?(optionA: TValue, optionB: TValue): boolean;
}
