/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { computed, DestroyRef, Directive, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { injectSiTranslateService } from '@siemens/element-translate-ng/translate';
import { asapScheduler, BehaviorSubject, Observable, of, switchMap, timer } from 'rxjs';
import { catchError, map, observeOn, shareReplay, take, tap } from 'rxjs/operators';

import { toTranslatedOptions, TypeaheadOptionCriterion } from '../si-filtered-search-helper';
import { OptionType } from '../si-filtered-search.model';
import { SiFilteredSearchValueBase } from './si-filtered-search-value.base';

@Directive()
export abstract class SiFilteredSearchOptionValueBase extends SiFilteredSearchValueBase {
  /** Original text used to resolve a newly entered criterion value. */
  readonly initialValueText = input<string>();

  /** Loads value options for the current criterion on demand. */
  readonly lazyValueProvider =
    input<(criterionName: string, typed: string | string[]) => Observable<OptionType[]>>();

  /** Delay in milliseconds before requesting lazy value options. */
  readonly searchDebounceTime = input.required<number>();

  /** Whether the editor only permits selecting configured options. */
  readonly onlySelectValue = input.required<boolean>();

  /** Maximum number of options displayed by the typeahead. */
  readonly maxCriteriaOptions = input.required<number>();

  /** Number of options visible before the typeahead scrolls. */
  readonly optionsInScrollableView = input.required<number>();

  /** Whether typing a colon or semicolon must not select an option. */
  readonly disableSelectionByColonAndSemicolon = input.required<boolean>();

  /** Whether strict or selection-only value validation is active. */
  readonly isStrictOrOnlySelectValue = input.required<boolean>();

  protected readonly inputChange = new BehaviorSubject('');
  protected readonly loadedOptions = signal<TypeaheadOptionCriterion[] | undefined>(undefined);

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

    // TODO: checking if options are empty is also questionable. Should be changed v47.
    const options = this.loadedOptions() ?? config.options;
    return (
      (options?.length && this.hasOptionValue()) ||
      (!options?.length && !!this.criterionValue().value)
    );
  });

  protected buildOptions(): Observable<TypeaheadOptionCriterion[]> {
    const provider = this.lazyValueProvider();
    let optionsStream: Observable<OptionType[]>;
    if (provider) {
      optionsStream = this.inputChange.pipe(
        switchMap((value, index) =>
          (index === 0 ? of(0) : timer(this.searchDebounceTime())).pipe(
            switchMap(() => provider(this.definition().name, value)),
            catchError(() => of(this.definition().options ?? []))
          )
        )
      );
    } else {
      optionsStream = of(this.definition().options ?? []);
    }

    return optionsStream.pipe(
      switchMap(options => {
        const keys = options.flatMap(option =>
          typeof option !== 'string' && option.label ? [option.label] : []
        );
        return this.translateService
          .translateAsync(keys)
          .pipe(map(translations => toTranslatedOptions(options, label => translations[label])));
      }),
      tap(options => this.loadedOptions.set(options)),
      takeUntilDestroyed(this.destroyRef),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  protected buildOptionValue(): void {
    const initialValue = this.criterionValue();
    if (initialValue.value?.length) {
      // Emit normalization after initialization, not during change detection.
      this.options()
        .pipe(take(1), observeOn(asapScheduler), takeUntilDestroyed(this.destroyRef))
        .subscribe(options => {
          if (this.criterionValue() !== initialValue) {
            return;
          }
          const value = this.processTypeaheadOptions(options);
          if (value !== undefined) {
            this.criterionValue.set({ ...initialValue, value });
          }
        });
    }
  }

  protected abstract processTypeaheadOptions(
    options: TypeaheadOptionCriterion[]
  ): string | string[] | undefined;
  protected abstract hasOptionValue(): boolean;
}
