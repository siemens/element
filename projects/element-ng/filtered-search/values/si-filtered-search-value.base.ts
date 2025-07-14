/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Directive, ElementRef, input, model, output, signal, Signal } from '@angular/core';

import { CriterionDefinition, CriterionValue } from '../si-filtered-search.model';

@Directive({
  host: {
    '[class.invalid-criterion]': '!validValue()',
    'class': 'pill pill-interactive px-0 criterion-value-section'
  }
})
export abstract class SiFilteredSearchValueBase {
  readonly active = model.required<boolean>();
  readonly criterionValue = model.required<CriterionValue>();
  readonly definition = input.required<CriterionDefinition>();
  readonly disabled = input.required<boolean>();
  readonly searchLabel = input.required<string>();

  readonly submitValue = output<{ freeText: string } | void>();
  readonly editValue = output();
  readonly backspaceOverflow = output();

  protected abstract readonly valueInput: Signal<ElementRef<HTMLInputElement> | undefined>;
  protected abstract readonly validValue: Signal<boolean>;

  readonly focusInOverlay = signal(false).asReadonly();

  focus(): void {
    this.valueInput()?.nativeElement.focus();
  }

  protected valueEnter(): void {
    if (
      !this.definition().multiSelect &&
      (this.criterionValue().value || this.criterionValue().dateValue)
    ) {
      this.active.set(false);
      this.submitValue.emit();
    }
  }

  protected valueBackspace(): void {
    if (!this.valueInput()!.nativeElement.value) {
      this.backspaceOverflow.emit();
    }
  }
}
