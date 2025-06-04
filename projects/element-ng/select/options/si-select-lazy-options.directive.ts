/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Directive, input, OnDestroy, signal } from '@angular/core';
import { of, Subject, switchMap } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { SelectItem, SelectOption } from '../si-select.types';
import { SelectOptionSource } from './si-select-option.source';
import { SI_SELECT_OPTIONS_STRATEGY, SiSelectOptionsStrategy } from './si-select-options-strategy';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'si-select[optionSource]',
  providers: [{ provide: SI_SELECT_OPTIONS_STRATEGY, useExisting: SiSelectLazyOptionsDirective }]
})
export class SiSelectLazyOptionsDirective<T> implements SiSelectOptionsStrategy<T>, OnDestroy {
  /**
   * {@inheritDoc SiSelectOptionsStrategy#loading}
   * @defaultValue false
   */
  readonly loading = signal(false);

  /**
   * {@inheritDoc SiSelectOptionsStrategy#rows}
   * @defaultValue []
   */
  readonly rows = signal<SelectItem<T>[]>([]);

  /**
   * {@inheritDoc SiSelectOptionsStrategy#selectedRows}
   * @defaultValue []
   */
  readonly selectedRows = signal<SelectOption<T>[]>([]);

  readonly optionSource = input.required<SelectOptionSource<T>>();

  private valueChange = new Subject<void>();
  private filterChange = new Subject<string | undefined>();

  constructor() {
    this.filterChange
      .pipe(
        debounceTime(100),
        switchMap(filterInput => {
          if (filterInput) {
            return this.optionSource().getOptionsForSearch!(filterInput);
          } else {
            const optionSource = this.optionSource();
            if (optionSource.getAllOptions) {
              return optionSource.getAllOptions();
            } else {
              return of(this.selectedRows());
            }
          }
        })
      )
      .subscribe(rows => {
        this.loading.set(false);
        this.rows.set(rows);
      });
  }

  ngOnDestroy(): void {
    this.valueChange.next();
    this.valueChange.complete();
    this.filterChange.complete();
  }

  /** {@inheritDoc SiSelectOptionsStrategy.onValueChange} */
  onValueChange(value: T[]): void {
    this.valueChange.next();

    // To prevent flickering, we need to check if we already got all the requested options.
    // This should always be the case if the user selects one
    const knownSelectedOptions = value
      .map(
        valueEntry =>
          this.selectedRows().find(selected => this.valueEqual(selected.value, valueEntry)) ??
          (this.rows().find(
            selected => selected.type === 'option' && this.valueEqual(selected.value, valueEntry)
          ) as SelectOption<T>)
      )
      .filter(v => !!v);

    const optionSource = this.optionSource();
    if (knownSelectedOptions.length === value.length) {
      if (optionSource.compareOptions) {
        knownSelectedOptions.sort(optionSource.compareOptions);
      }
      this.selectedRows.set(knownSelectedOptions);
    } else {
      // We don't have all options, so we need to fetch them.
      optionSource
        .getOptionsForValues(value)
        .pipe(takeUntil(this.valueChange))
        .subscribe(selectedOptions => this.selectedRows.set(selectedOptions));
    }
  }

  /** {@inheritDoc SiSelectOptionsStrategy.onFilter} */
  onFilter(filterInput?: string): void {
    this.filterChange.next(filterInput);
    this.loading.set(true);
  }

  private valueEqual(a?: T, b?: T): boolean {
    if (a === b) {
      return true;
    }
    if (!a || !b) {
      return false;
    }

    const optionSource = this.optionSource();
    if (optionSource.valuesEqual) {
      return optionSource.valuesEqual(a, b);
    }

    return false;
  }
}
