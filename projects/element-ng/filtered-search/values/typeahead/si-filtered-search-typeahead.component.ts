/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  OnChanges,
  OnInit,
  signal,
  SimpleChanges,
  untracked,
  viewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiTypeaheadDirective, TypeaheadMatch } from '@siemens/element-ng/typeahead';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';

import { TypeaheadOptionCriterion } from '../../si-filtered-search-helper';
import { OptionCriterion } from '../../si-filtered-search.model';
import { SiFilteredSearchOptionValueBase } from '../si-filtered-search-option-value.base';
import { SiFilteredSearchValueBase } from '../si-filtered-search-value.base';

@Component({
  selector: 'si-filtered-search-typeahead',
  imports: [SiTypeaheadDirective, FormsModule, SiTranslatePipe],
  templateUrl: './si-filtered-search-typeahead.component.html',
  styleUrl: './si-filtered-search-typeahead.component.scss',
  providers: [
    { provide: SiFilteredSearchValueBase, useExisting: SiFilteredSearchTypeaheadComponent }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiFilteredSearchTypeaheadComponent
  extends SiFilteredSearchOptionValueBase
  implements OnChanges, OnInit
{
  protected override readonly valueInput = viewChild<ElementRef<HTMLInputElement>>('valueInput');
  protected readonly optionValue = signal<OptionCriterion | undefined>(undefined);

  // This must be a separate signal as it should only emit when the actual empty state changes.
  private readonly inputEmpty = computed(() => !this.criterionValue().value);

  // This MUST only be updated if the active state changes.
  // Otherwise, user values might be overridden.
  // It is only used to pass the initial input value if the user starts editing the input.
  readonly valueLabel = computed(() => {
    // This is needed for the clear button.
    // But we cannot subscribe to the value changes itself, as those would cause to many updates.
    if (this.inputEmpty()) {
      return '';
    }

    if (this.active()) {
      const option = untracked(() => this.optionValue());
      if (option) {
        return option.label ? this.translateService.translateSync(option.label) : option.value;
      } else {
        return untracked(() => this.criterionValue().value) as string;
      }
    }
    return '';
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.criterionValue && this.criterionValue().value !== this.optionValue()?.value) {
      this.optionValue.set(undefined);
    }
  }

  ngOnInit(): void {
    this.inputChange.next((this.criterionValue().value as string) ?? '');
    this.buildOptionValue();
  }

  protected valueChange(newValue: string | string[]): void {
    if (typeof newValue === 'string') {
      const match = newValue.match(/(.+?);(.*)$/);
      let value: string;
      if (!this.disableSelectionByColonAndSemicolon() && match) {
        value = match[1];
        this.submitValue.emit({ freeText: match[2] });
      } else {
        value = newValue;
      }
      this.optionValue.set(undefined);
      this.criterionValue.update(v => ({ ...v, value }));
      this.inputChange.next(newValue);
    }
  }

  protected valueTypeaheadFullMatch(match: TypeaheadMatch): void {
    const option = match.option as TypeaheadOptionCriterion;
    this.optionValue.set(option);
    // Usually, we already emitted a change in onCriterionValueInputChange using the text entered by the user.
    // In case of a fullMatch, we should check if the value is different from label.
    // If it is different, we must emit another event using the value instead of the label.
    // TODO: prevent the emit of the label matching the option. This is currently not possible due to the order events.
    if (option.value !== option.translatedLabel) {
      this.criterionValue.update(v => ({ ...v, value: option.value }));
    }
  }

  protected valueTypeaheadSelect(match: TypeaheadMatch): void {
    this.valueTypeaheadFullMatch(match);
    this.submitValue.emit();
  }

  protected valueFilterKeys(event: KeyboardEvent): void {
    // In integer mode, no floating point numbers are allowed.
    // So we prevent the input of '.' or ','.
    if (
      this.definition().validationType === 'integer' &&
      (event.key === '.' || event.key === ',')
    ) {
      event.preventDefault();
    }
  }

  protected processTypeaheadOptions(options: TypeaheadOptionCriterion[]): void {
    this.optionValue.set(
      options.find(
        option =>
          option.value === this.criterionValue().value ||
          // TODO: remove this. I don't know why, but it seems like previously FS accepted labels as well
          option.translatedLabel === this.criterionValue().value
      )
    );
    // Sneaky patch the value.
    // We did not emit a change, as no user interaction happened.
    // We should consider dropping this, but there is currently a unit test checking this behavior.
    const optionValue = this.optionValue();
    if (optionValue) {
      // TODO: The last ?? optionValue.label is non-sense, but we have a unit test checking this behavior.
      this.criterionValue().value = optionValue.value ?? optionValue.label;
    }
  }

  protected hasOptionValue(): boolean {
    return !!this.optionValue();
  }
}
