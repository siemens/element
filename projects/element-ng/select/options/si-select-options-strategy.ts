/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { InjectionToken, Signal } from '@angular/core';

import { SelectItem, SelectOption } from '../si-select.types';

export const SI_SELECT_OPTIONS_STRATEGY = new InjectionToken<SiSelectOptionsStrategy<unknown>>(
  'si-select.options-strategy'
);

export interface SiSelectOptionsStrategy<T> {
  /**
   * List of all rows that should be rendered in a selection list.
   */
  readonly rows: Signal<readonly SelectItem<T>[]>;

  /**
   * List of all options that are currently selected.
   * Must be updated when {@link onValueChange} is called.
   */
  readonly selectedRows: Signal<readonly SelectOption<T>[]>;

  /**
   * Indicate loading state of the options.
   */
  readonly loading?: Signal<boolean>;

  /**
   * Is always called when the value changes.
   * The implementation must update {@link selectedRows} when called.
   *
   * @param value - currently selected value of the related si-select.
   */
  onValueChange(value: readonly T[]): void;

  /**
   * This function is called when a user enters a filter query.
   * It is expected that an implementation will update the `rows`
   * based on the query.
   *
   * @param filterInput - Unprocessed input by user in the filterInput field
   */
  onFilter?(filterInput?: string): void;
}
