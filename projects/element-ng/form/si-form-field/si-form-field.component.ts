/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  contentChild,
  DestroyRef,
  effect,
  inject,
  input,
  isSignal
} from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { SiTranslatePipe, TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiFormFieldsetComponent } from '../form-fieldset/si-form-fieldset.component';
import { SiFormFieldsetControl } from '../form-fieldset/si-form-fieldset.control';
import { SI_FORM_ITEM_CONTROL } from '../si-form-item.control';
import { SiFormValidationErrorService } from '../si-form-validation-error.service';

/**
 * Constructs a full form field including error messages, labels and aria-* attributes.
 * It must be used with Angular's signal forms.
 *
 * @example
 * ```html
 * <si-form-field label="Name">
 *   <input class="form-control" [formField]="form.name" />
 *
 *   <!-- Optional help button -->
 *   <button
 *     si-help-button
 *     type="button"
 *     siHelpTitle="Help for name"
 *     siHelpContent="The context help description"
 *   >More information about the name</button>
 * </si-form-field>
 * ```
 */
@Component({
  selector: 'si-form-field',
  imports: [SiTranslatePipe, NgTemplateOutlet],
  templateUrl: './si-form-field.component.html',
  styleUrl: './si-form-field.component.scss',
  host: {
    '[class.required]': 'showRequired()',
    '[class.form-check]': 'isFormCheck()',
    '[class.form-check-inline]': 'fieldset?.inline()'
  }
})
export class SiFormFieldComponent implements SiFormFieldsetControl {
  private static idCounter = 0;

  /**
   * The label to be displayed in the form field.
   * It will be translated if a translation key is available.
   */
  readonly label = input.required<TranslatableString>();

  private readonly formField = contentChild.required(FormField);
  private readonly fieldControl = contentChild(SI_FORM_ITEM_CONTROL, { descendants: true });

  protected readonly fieldset = inject(SiFormFieldsetComponent, { optional: true });

  private readonly validationErrorService = inject(SiFormValidationErrorService);

  private readonly generatedId = `__si-form-field-${SiFormFieldComponent.idCounter++}`;

  /** The id of the connected control, used for the label's `for` attribute. */
  protected readonly controlId = computed(() => {
    const id = this.fieldControl()?.id;
    return (isSignal(id) ? id() : id) ?? (this.formField().element.id || this.generatedId);
  });

  protected readonly errormessageId = computed(() => {
    const id = this.fieldControl()?.errormessageId;
    return (isSignal(id) ? id() : id) ?? `${this.controlId()}-errormessage`;
  });

  protected readonly labelledby = computed(() => {
    const labelledby = this.fieldControl()?.labelledby;
    return isSignal(labelledby) ? labelledby() : labelledby;
  });

  /** Whether the connected control is a form-check (checkbox, radio or switch). */
  protected readonly isFormCheck = computed(
    () =>
      this.fieldControl()?.isFormCheck ??
      this.formField().element.classList.contains('form-check-input')
  );

  private readonly fieldState = computed(() => this.formField().state());

  /** @internal */
  readonly control = computed(() => this.fieldState().fieldTree);

  /** @internal */
  readonly required = computed(() => this.fieldState().required());

  /** @internal  */
  readonly showRequired = computed(() => this.required() && !this.isPartOfRadioGroup());

  private readonly invalid = computed(() => {
    const state = this.fieldState();
    return state.touched() && state.invalid();
  });

  /** @internal */
  readonly touched = computed(() => this.fieldState().touched());

  protected readonly isPartOfRadioGroup = computed(() => this.fieldset?.hasOnlyRadios() ?? false);

  /** @internal */
  readonly errors = computed(() => {
    const state = this.fieldState();
    if (!state.touched()) {
      return [];
    }

    return this.validationErrorService.resolveFormFieldErrors(state);
  });

  constructor() {
    if (this.fieldset) {
      this.fieldset.registerControl(this);
      inject(DestroyRef).onDestroy(() => this.fieldset!.unregisterControl(this));
    }

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
