/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  OnChanges,
  OnInit,
  signal,
  SimpleChanges,
  viewChild
} from '@angular/core';
import { SiTypeaheadDirective, TypeaheadMatch } from '@siemens/element-ng/typeahead';
import { SiTranslateModule, TranslatableString } from '@siemens/element-translate-ng/translate';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { selectOptions, TypeaheadOptionCriterion } from '../../si-filtered-search-helper';
import { OptionCriterion } from '../../si-filtered-search.model';
import { SiFilteredSearchOptionValueBase } from '../si-filtered-search-option-value.base';
import { SiFilteredSearchValueBase } from '../si-filtered-search-value.base';

@Component({
  selector: 'si-filtered-search-multi-select',
  imports: [SiTranslateModule, SiTypeaheadDirective],
  templateUrl: './si-filtered-search-multi-select.component.html',
  styleUrl: './si-filtered-search-multi-select.component.scss',
  providers: [
    { provide: SiFilteredSearchValueBase, useExisting: SiFilteredSearchMultiSelectComponent }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiFilteredSearchMultiSelectComponent
  extends SiFilteredSearchOptionValueBase
  implements OnChanges, OnInit
{
  readonly itemCountText = input.required<TranslatableString>();
  protected override readonly valueInput = viewChild<ElementRef<HTMLInputElement>>('valueInput');
  protected readonly optionValue = signal<OptionCriterion[]>([]);
  protected readonly selectionChange = new BehaviorSubject<string[]>([]);

  readonly hasMultiSelections = computed(
    () => Array.isArray(this.criterionValue().value) && this.criterionValue().value!.length > 1
  );

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.criterionValue &&
      this.criterionValue().value?.length !== this.optionValue().length
    ) {
      this.optionValue.set([]);
      this.selectionChange.next([]);
    }
  }

  ngOnInit(): void {
    this.inputChange.next('');
    this.selectionChange.next(this.criterionValue().value as string[]);
    this.buildOptionValue();
  }

  protected valueTypeaheadSelect(match: TypeaheadMatch): void {
    const option = match.option as OptionCriterion;
    if (match.itemSelected) {
      this.criterionValue.update(v => ({ ...v, value: [...v.value!, option.value] }));
      this.optionValue.update(v => [...v, option]);
    } else {
      const value = this.criterionValue();
      if (typeof value.value !== 'string') {
        this.criterionValue.set({
          ...value,
          value: value.value?.filter(elem => elem !== option.value)
        });
      }
      this.optionValue.update(v => v.filter(elem => elem.value !== option.value));
    }
    this.selectionChange.next(this.criterionValue().value as string[]);
  }

  protected override buildOptions(): Observable<TypeaheadOptionCriterion[]> | undefined {
    const translatedOptions = super.buildOptions();
    return translatedOptions?.pipe(
      switchMap(options =>
        this.selectionChange!.pipe(
          tap(value => {
            selectOptions(options, value);
          }),
          map(() => options)
        )
      )
    );
  }

  protected processTypeaheadOptions(options: TypeaheadOptionCriterion[]): void {
    const value = this.criterionValue().value as string[];
    this.optionValue.set(
      options.filter(
        option =>
          value.includes(option.value) ||
          // TODO: remove this. I don't know why, but it seems like previously FS accepted labels as well
          value.includes(option.translatedLabel)
      )
    );
    // Sneaky patch the value.
    // We did not emit a change, as no user interaction happened.
    // We should consider dropping this, but there is currently a unit test checking this behavior.
    value.splice(0, value.length, ...this.optionValue().map(option => option.value));
  }

  protected hasOptionValue(): boolean {
    return !!this.optionValue().length;
  }
}
