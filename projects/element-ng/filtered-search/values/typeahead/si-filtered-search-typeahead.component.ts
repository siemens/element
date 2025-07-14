/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  OnChanges,
  OnInit,
  signal,
  SimpleChanges,
  untracked,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { SiTypeaheadDirective, TypeaheadMatch } from '@siemens/element-ng/typeahead';
import {
  injectSiTranslateService,
  SiTranslateModule
} from '@siemens/element-translate-ng/translate';
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs';
import { debounceTime, first, map, tap } from 'rxjs/operators';

import {
  InternalCriterionDefinition,
  selectOptions,
  toOptionCriteria,
  TypeaheadOptionCriterion
} from '../../si-filtered-search-helper';
import { OptionCriterion, OptionType } from '../../si-filtered-search.model';
import { SiFilteredSearchValueBase } from '../si-filtered-search-value.base';

@Component({
  selector: 'si-filtered-search-typeahead',
  imports: [SiTypeaheadDirective, FormsModule, SiTranslateModule],
  templateUrl: './si-filtered-search-typeahead.component.html',
  styleUrl: './si-filtered-search-typeahead.component.scss',
  providers: [
    { provide: SiFilteredSearchValueBase, useExisting: SiFilteredSearchTypeaheadComponent }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiFilteredSearchTypeaheadComponent
  extends SiFilteredSearchValueBase
  implements OnChanges, OnInit
{
  readonly lazyValueProvider =
    input<(criterionName: string, typed: string | string[]) => Observable<OptionType[]>>();
  readonly searchDebounceTime = input.required<number>();
  readonly itemCountText = input.required<string>();
  readonly items = input.required<string>();
  readonly onlySelectValue = input.required<boolean>();
  readonly maxCriteriaOptions = input.required<number>();
  readonly optionsInScrollableView = input.required<number>();
  readonly readonly = input.required<boolean>();
  readonly disableSelectionByColonAndSemicolon = input.required<boolean>();
  readonly isStrictOrOnlySelectValue = input.required<boolean>();

  private readonly inputChange = new BehaviorSubject('');
  private readonly selectionChange = new BehaviorSubject<string[]>([]);

  protected override readonly valueInput = viewChild<ElementRef<HTMLInputElement>>('valueInput');
  protected readonly optionValue = signal<OptionCriterion[]>([]);

  private readonly destroyRef = inject(DestroyRef);
  private readonly translateService = injectSiTranslateService();

  readonly inputType = computed(() =>
    this.definition().validationType === 'integer' || this.definition().validationType === 'float'
      ? 'number'
      : 'text'
  );
  readonly step = computed(() => (this.definition().validationType === 'integer' ? '1' : 'any'));
  readonly options = computed(() => this.buildOptions());
  readonly hasMultiSelections = computed(
    () =>
      this.definition().multiSelect &&
      Array.isArray(this.criterionValue().value) &&
      this.criterionValue().value!.length > 1
  );
  override readonly validValue = computed(() => {
    const config = this.definition();
    if (!this.isStrictOrOnlySelectValue() && !config.strictValue && !config.onlySelectValue) {
      return true;
    }

    // TODO: this never worked with lazy options. We should fix that.
    // TODO: checking if options are empty is also questionable. Should be changed v47.
    return !!(
      (config.options?.length && this.optionValue().length) ||
      (!config.options?.length && !!this.criterionValue().value)
    );
  });
  // This MUST only be updated if the active state changes.
  // Otherwise, user values might be overridden.
  // It is only used to pass the initial input value if the user starts editing the input.
  readonly valueLabel = computed(() => {
    if (this.active()) {
      const optionValue = untracked(() => this.optionValue());
      const definition = untracked(() => this.definition());
      if (optionValue.length && !definition.multiSelect) {
        const [option] = optionValue;
        return option.label ? this.translateService.translateSync(option.label) : option.value;
      } else if (!definition.multiSelect) {
        return untracked(() => this.criterionValue().value) as string;
      }
    }
    return '';
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (
      this.definition().multiSelect &&
      changes.criterionValue &&
      this.criterionValue().value?.length !== this.optionValue().length
    ) {
      this.optionValue.set([]);
      this.selectionChange.next([]);
    }
  }

  ngOnInit(): void {
    this.inputChange.next(
      this.definition().multiSelect ? '' : ((this.criterionValue().value as string) ?? '')
    );
    if (this.definition().multiSelect) {
      this.selectionChange.next(this.criterionValue().value as string[]);
    }
    this.buildOptionValue();
  }

  protected valueFilterKeys(event: KeyboardEvent): void {
    if (
      this.definition().validationType === 'integer' &&
      (event.key === '.' || event.key === ',')
    ) {
      event.preventDefault();
    }
  }

  protected valueChange(newValue: string | string[]): void {
    if (!this.definition().multiSelect && typeof newValue === 'string') {
      const match = newValue.match(/(.+?);(.*)$/);
      let value: string;
      if (!this.disableSelectionByColonAndSemicolon() && match) {
        value = match[1];
        this.submitValue.emit({ freeText: match[2] });
      } else {
        value = newValue;
      }
      this.optionValue.set([]);
      this.criterionValue.update(v => ({ ...v, value }));
      this.inputChange.next(newValue);
    }
  }

  protected valueTypeaheadFullMatch(match: TypeaheadMatch): void {
    if (this.definition().multiSelect) {
      return;
    }
    const option = match.option as TypeaheadOptionCriterion;
    this.optionValue.set([option]);
    // Usually, we already emitted a change in onCriterionValueInputChange using the text entered by the user.
    // In case of a fullMatch, we should check if the value is different from label.
    // If it is different, we must emit another event using the value instead of the label.
    // TODO: prevent the emit of the label matching the option. This is currently not possible due to the order events.
    if (option.value !== option.translatedLabel) {
      this.criterionValue.update(v => ({ ...v, value: option.value }));
    }
  }

  protected valueTypeaheadSelect(match: TypeaheadMatch): void {
    if (!this.definition().multiSelect) {
      this.valueTypeaheadFullMatch(match);
      this.submitValue.emit();
    } else {
      // In multi-select scenarios, the internal model value is always of type array
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
  }

  private buildOptions(): Observable<TypeaheadOptionCriterion[]> | undefined {
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

    let translatedOptionsStream = optionsStream?.pipe(
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

    if (this.definition().multiSelect && this.definition().options) {
      translatedOptionsStream = translatedOptionsStream?.pipe(
        switchMap(options =>
          this.selectionChange!.pipe(
            tap(value => selectOptions(options, value)),
            map(() => options)
          )
        )
      );
    }

    return translatedOptionsStream;
  }

  private buildOptionValue(): void {
    if (!this.criterionValue().value?.length) {
      this.optionValue.set([]);
    } else {
      // resolve options for initial values
      this.options()!
        .pipe(first())
        .subscribe(options => {
          if (this.definition().multiSelect) {
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
          } else {
            this.optionValue.set(
              options.filter(
                option =>
                  option.value === this.criterionValue().value ||
                  // TODO: remove this. I don't know why, but it seems like previously FS accepted labels as well
                  option.translatedLabel === this.criterionValue().value
              )
            );
            // Sneaky patch the value.
            // We did not emit a change, as no user interaction happened.
            // We should consider dropping this, but there is currently a unit test checking this behavior.
            const [optionValue] = this.optionValue();
            if (optionValue) {
              // TODO: The last ?? optionValue.label is non-sense, but we have a unit test checking this behavior.
              this.criterionValue().value = optionValue.value ?? optionValue.label;
            }
          }
        });
    }
  }
}
