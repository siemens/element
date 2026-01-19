/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { computed, DestroyRef, Directive, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { injectSiTranslateService } from '@siemens/element-translate-ng/translate';
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs';
import { debounceTime, first, map, tap } from 'rxjs/operators';

import {
  InternalCriterionDefinition,
  toOptionCriteria,
  TypeaheadOptionCriterion
} from '../si-filtered-search-helper';
import { OptionCriterion, OptionType } from '../si-filtered-search.model';
import { SiFilteredSearchValueBase } from './si-filtered-search-value.base';

@Directive()
export abstract class SiFilteredSearchOptionValueBase extends SiFilteredSearchValueBase {
  readonly lazyValueProvider =
    input<(criterionName: string, typed: string | string[]) => Observable<OptionType[]>>();
  readonly searchDebounceTime = input.required<number>();
  readonly onlySelectValue = input.required<boolean>();
  readonly maxCriteriaOptions = input.required<number>();
  readonly optionsInScrollableView = input.required<number>();
  readonly disableSelectionByColonAndSemicolon = input.required<boolean>();
  readonly isStrictOrOnlySelectValue = input.required<boolean>();

  protected readonly inputChange = new BehaviorSubject('');

  private readonly destroyRef = inject(DestroyRef);
  protected readonly translateService = injectSiTranslateService();

  readonly inputType = computed(() =>
    this.definition().validationType === 'integer' || this.definition().validationType === 'float'
      ? 'number'
      : 'text'
  );
  readonly step = computed(() => (this.definition().validationType === 'integer' ? '1' : 'any'));
  readonly options = computed(() => this.buildOptions());
  override readonly validValue = computed(() => {
    const config = this.definition();
    if (!this.isStrictOrOnlySelectValue() && !config.strictValue && !config.onlySelectValue) {
      return true;
    }

    // TODO: this never worked with lazy options. We should fix that.
    // TODO: checking if options are empty is also questionable. Should be changed v47.
    return (
      (config.options?.length && this.hasOptionValue()) ||
      (!config.options?.length && !!this.criterionValue().value)
    );
  });

  protected buildOptions(): Observable<TypeaheadOptionCriterion[]> | undefined {
    let optionsStream: Observable<OptionCriterion[]> | undefined;
    if (this.lazyValueProvider()) {
      optionsStream = this.inputChange.pipe(
        debounceTime(this.searchDebounceTime()),
        takeUntilDestroyed(this.destroyRef),
        switchMap(value => {
          return this.lazyValueProvider()!(
            this.definition().name,
            // TODO: fix lazy loading for multi-select. Seems to be not needed, but it should work.
            this.definition().multiSelect ? '' : (value ?? '')
          ).pipe(
            map(options => toOptionCriteria(options)),
            tap(
              options =>
                ((this.definition() ?? ({} as InternalCriterionDefinition)).options = options)
            )
          );
        })
      );
    } else if (this.definition()) {
      optionsStream = of(toOptionCriteria(this.definition().options));
    }

    return optionsStream?.pipe(
      switchMap(options => {
        const keys: string[] = options.map(option => option.label!).filter(label => !!label);
        return this.translateService.translateAsync(keys).pipe(
          map(translations =>
            options.map(option => ({
              ...option,
              translatedLabel: translations[option.label!] ?? option.label ?? option.value
            }))
          )
        );
      })
    );
  }

  protected buildOptionValue(): void {
    if (this.criterionValue().value?.length) {
      // resolve options for initial values
      this.options()!
        .pipe(first())
        .subscribe(options => this.processTypeaheadOptions(options));
    }
  }

  protected abstract processTypeaheadOptions(value: TypeaheadOptionCriterion[]): void;
  protected abstract hasOptionValue(): boolean;
}
