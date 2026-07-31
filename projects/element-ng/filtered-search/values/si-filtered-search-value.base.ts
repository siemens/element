/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Directive, ElementRef, input, model, output, signal, Signal } from '@angular/core';
import { TranslatableString } from '@siemens/element-translate-ng/translate';

import { CriterionDefinition, CriterionValue } from '../si-filtered-search.model';

@Directive({
  host: {
    '[class.invalid-criterion]': '!validValue()',
    'class': 'pill pill-interactive px-0 criterion-value-section'
  }
})
export abstract class SiFilteredSearchValueBase {
  /** Whether the value editor is active. Supports two-way binding through `activeChange`. */
  readonly active = model.required<boolean>();

  /** Current criterion value. Supports two-way binding through `criterionValueChange`. */
  readonly criterionValue = model.required<CriterionValue>();

  /** Definition that configures the criterion value editor. */
  readonly definition = input.required<CriterionDefinition>();

  /** Whether the value editor is disabled. */
  readonly disabled = input.required<boolean>();

  /** Accessible label for the value input. */
  readonly searchLabel = input.required<TranslatableString>();

  /** Emits when a valid value is submitted, optionally with free-text content. */
  readonly submitValue = output<{ freeText: string } | void>();

  /** Emits when the inactive value display is activated for editing. */
  readonly editValue = output();

  /** Emits when Backspace is pressed in an empty value input. */
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
