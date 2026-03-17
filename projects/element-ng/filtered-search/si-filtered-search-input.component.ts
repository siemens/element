/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
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

  readonly dataSource = input.required<Observable<InternalCriterionDefinition[]>>();
  readonly typeaheadOptionsLimit = input.required<number>();
  readonly optionsInScrollableView = input.required<number>();
  readonly disabled = input.required<boolean>();
  readonly placeholder = input.required<string>();
  readonly searchLabel = input.required<TranslatableString>();
  readonly searchValue = model.required<string>();
  readonly freeTextCriterion = input.required<boolean>();
  readonly maxCriteriaReached = input.required<boolean>();
  readonly allowFreeText = input.required<boolean>();
  readonly searchForFreeTextLabel = input.required<TranslatableString>();
  readonly disableSelectionByColonAndSemicolon = input.required<boolean>();
  readonly onlySelectValue = input.required<boolean>();

  readonly createCriterion = output<{ criterion: InternalCriterionDefinition; value?: string }>();
  readonly createCriterionByName = output<{ criterionName: string; value?: string }>();
  readonly backspaceOverflow = output();
  readonly createFreeTextPill = output<string>();
  readonly inputFocus = output();
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
