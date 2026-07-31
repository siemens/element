/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ScrollStrategy } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  model,
  output,
  viewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiTypeaheadDirective, TypeaheadOption } from '@siemens/element-ng/typeahead';
import { SiTranslatePipe, TranslatableString } from '@siemens/element-translate-ng/translate';
import { Observable } from 'rxjs';

import { InternalCriterionDefinition } from './si-filtered-search-helper';

@Component({
  selector: 'si-filtered-search-input',
  imports: [FormsModule, SiTypeaheadDirective, SiTranslatePipe],
  templateUrl: './si-filtered-search-input.component.html',
  styleUrl: './si-filtered-search-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'w-100'
  }
})
export class SiFilteredSearchInputComponent {
  private static readonly criterionRegex = /(.+?):(.*)$/;

  /** Supplies the criterion definitions shown in the typeahead. */
  readonly dataSource = input.required<Observable<InternalCriterionDefinition[]>>();

  /** Limits the number of criterion options displayed in the typeahead. */
  readonly typeaheadOptionsLimit = input.required<number>();

  /** Sets the number of options visible before the typeahead scrolls. */
  readonly optionsInScrollableView = input.required<number>();

  /** Whether the search input is disabled. */
  readonly disabled = input.required<boolean>();

  /** Placeholder text shown when the search input is empty. */
  readonly placeholder = input.required<string>();

  /** Accessible label for the search input. */
  readonly searchLabel = input.required<TranslatableString>();

  /** Factory for the CDK scroll strategy used by the criterion typeahead overlay. */
  readonly scrollStrategyFactory = input.required<() => ScrollStrategy>();

  /** Current search text. Supports two-way binding through `searchValueChange`. */
  readonly searchValue = model.required<string>();

  /** Whether the current criterion accepts free-text values. */
  readonly freeTextCriterion = input.required<boolean>();

  /** Whether the configured maximum number of criteria has been reached. */
  readonly maxCriteriaReached = input.required<boolean>();

  /** Whether users can create a free-text criterion. */
  readonly allowFreeText = input.required<boolean>();

  /** Label for the typeahead option that creates a free-text criterion. */
  readonly searchForFreeTextLabel = input.required<TranslatableString>();

  /** Whether typing a colon or semicolon must not select a criterion. */
  readonly disableSelectionByColonAndSemicolon = input.required<boolean>();

  /** Whether the input only permits selecting values from the typeahead. */
  readonly onlySelectValue = input.required<boolean>();

  /** Emits the selected criterion and an optional value typed with it. */
  readonly createCriterion = output<{ criterion: InternalCriterionDefinition; value?: string }>();

  /** Emits a criterion name and optional value parsed from the input text. */
  readonly createCriterionByName = output<{ criterionName: string; value?: string }>();

  /** Emits when Backspace is pressed in an empty search input. */
  readonly backspaceOverflow = output();

  /** Emits the text used to create a free-text criterion. */
  readonly createFreeTextPill = output<string>();

  /** Emits when the search input receives focus. */
  readonly inputFocus = output();

  /** Emits when Enter is pressed in the search input. */
  readonly enterSubmit = output();

  private readonly inputElement =
    viewChild.required<ElementRef<HTMLInputElement>>('freeTextInputElement');

  /** Public method to focus the input element */
  focus(): void {
    this.inputElement().nativeElement.focus();
  }

  protected readonly typeaheadCreateOption = computed(() =>
    this.freeTextCriterion() && !this.maxCriteriaReached() && this.allowFreeText()
      ? this.searchForFreeTextLabel()
      : undefined
  );
  protected readonly typeaheadScrollStrategy = computed(() => this.scrollStrategyFactory()());

  protected freeTextBackspaceHandler(event: Event): void {
    if (!(event.target as HTMLInputElement).value) {
      this.backspaceOverflow.emit();
    }
  }

  protected freeTextInputHandler(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    const match = value.match(SiFilteredSearchInputComponent.criterionRegex);
    if (!this.disableSelectionByColonAndSemicolon() && !this.onlySelectValue() && match) {
      const criterionName = match[1];
      this.inputElement().nativeElement.value = '';
      this.searchValue.set('');

      this.createCriterionByName.emit({ criterionName: criterionName, value: match[2] });
    } else {
      this.searchValue.set(value);
    }
  }

  protected freeTextBlurHandler(): void {
    queueMicrotask(() => {
      if (this.freeTextCriterion() && this.searchValue().length > 0) {
        this.createFreeTextPill.emit(this.searchValue());
      }
    });
  }

  protected typeaheadOnSelectCriterionHandler(event: TypeaheadOption): void {
    const criterion = event as InternalCriterionDefinition;
    // Removes the focus border before creating a new criterion to prevent the impression of jumping content.
    this.inputElement().nativeElement.blur();
    this.createCriterion.emit({ criterion });
    this.searchValue.set('');
  }

  protected createFreeTextPillHandler(query: string): void {
    this.createFreeTextPill.emit(query);
    this.searchValue.set('');
  }
}
