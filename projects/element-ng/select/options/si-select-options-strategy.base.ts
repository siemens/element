/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { computed, Directive, InputSignal, Signal, signal } from '@angular/core';

import { SelectItem, SelectOption } from '../si-select.types';
import { SiSelectOptionsStrategy } from './si-select-options-strategy';

/**
 * Input options strategy base class, for eagerly fetched options.
 */
@Directive()
export abstract class SiSelectOptionsStrategyBase<T> implements SiSelectOptionsStrategy<T> {
  /**
   * Function to compare two values on equality which is used to match/filter options.
   */
  abstract optionsEqual: InputSignal<(a: T, b: T) => boolean>;

  /**
   * Rows that should be shown.
   *
   * @defaultValue []
   */
  readonly rows = signal<SelectItem<T>[]>([]);
  /**
   * All group and option items in the dropdown.
   *
   * @defaultValue []
   */
  abstract readonly allRows: Signal<(SelectItem<T> | SelectOption<T>)[]>;

  private readonly value = signal<T[]>([]);

  readonly selectedRows = computed(() => {
    const values = this.value();
    return this.allRows()
      .map(row => (row.type === 'group' ? row.options : row))
      .flat()
      .filter(option => values.some(value => this.optionsEqual()(value, option.value)));
  });

  onValueChange(value: T[]): void {
    this.value.set(value);
  }

  onFilter(filterValue?: string): void {
    if (filterValue) {
      const filterValueLC = filterValue.toLowerCase();
      const checkRow: (row: SelectOption<T>) => boolean = (row: SelectOption<T>) =>
        (row.typeaheadLabel ?? row.label)!.toLowerCase().includes(filterValueLC!);

      this.rows.set(
        this.allRows().reduce((rows, row) => {
          if (row.type === 'option' && checkRow(row)) {
            rows.push(row);
          } else if (row.type === 'group') {
            if (row.label!.toLowerCase().includes(filterValueLC!)) {
              rows.push(row);
            } else {
              const options = row.options.filter(checkRow);

              if (options.length) {
                rows.push({ ...row, options });
              }
            }
          }

          return rows;
        }, [] as SelectItem<T>[])
      );
    } else {
      this.rows.set(this.allRows());
    }
  }
}
