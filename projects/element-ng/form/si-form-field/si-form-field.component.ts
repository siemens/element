/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, contentChild, effect, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { SiTranslatePipe, TranslatableString } from '@siemens/element-translate-ng/translate';

/**
 * Constructs a full form field including error messages, labels and aria-* attributes.
 * It must be used with Angular's signal forms.
 *
 * @example
 * ```html
 * <si-form-field label="Name">
 *   <input class="form-control" [formField]="form.name" />
 * </si-form-field>
 * ```
 */
@Component({
  selector: 'si-form-field',
  imports: [SiTranslatePipe, NgTemplateOutlet],
  templateUrl: './si-form-field.component.html',
  styleUrl: './si-form-field.component.scss',
  host: {
    '[class.required]': 'required()',
    '[class.form-check]': 'isFormCheck()'
  }
})
export class SiFormFieldComponent {
  private static idCounter = 0;

  /**
   * The label to be displayed in the form field.
   * It will be translated if a translation key is available.
   */
  readonly label = input.required<TranslatableString>();

  private readonly formField = contentChild.required(FormField);

  private readonly generatedId = `__si-form-field-${SiFormFieldComponent.idCounter++}`;

  /** The id of the connected control, used for the label's `for` attribute. */
  protected readonly controlId = computed(() => this.formField().element.id || this.generatedId);

  protected readonly errormessageId = computed(() => `${this.controlId()}-errormessage`);

  /** Whether the connected control is a form-check (checkbox, radio or switch). */
  protected readonly isFormCheck = computed(() =>
    this.formField().element.classList.contains('form-check-input')
  );

  private readonly fieldState = computed(() => this.formField().state());

  protected readonly required = computed(() => this.fieldState().required());

  private readonly invalid = computed(() => {
    const state = this.fieldState();
    return state.touched() && state.invalid();
  });

  protected readonly errors = computed(() => {
    const state = this.fieldState();
    if (!state.touched()) {
      return [];
    }
    return state.errors().filter(error => !!error.message);
  });

  constructor() {
    effect(() => this.syncControlId());
    effect(() => this.syncErrorDescription());
    effect(() => this.syncInvalidState());
  }

  private syncControlId(): void {
    const element = this.formField().element;
    if (!element.id) {
      element.id = this.generatedId;
    }
  }

  /** Associates the error messages with the projected control for assistive technologies. */
  private syncErrorDescription(): void {
    this.formField().element.setAttribute('aria-describedby', this.errormessageId());
  }

  /**
   * Reflects the validation state onto the projected control via `aria-invalid`. This is needed
   * because signal forms does not set `aria-invalid`, and the native `:user-invalid` pseudo-class
   * ignores `markAsTouched()`. The matching `.ng-invalid`/`.ng-touched` classes that drive the
   * styling are added by signal forms itself, see `provideSiFormFieldConfig()`.
   */
  private syncInvalidState(): void {
    const element = this.formField().element;
    if (this.invalid()) {
      element.setAttribute('aria-invalid', 'true');
    } else {
      element.removeAttribute('aria-invalid');
    }
  }
}
