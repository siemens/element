/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet } from '@angular/common';
import {
  AfterContentChecked,
  AfterContentInit,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  ElementRef,
  inject,
  input,
  Input,
  isSignal,
  OnChanges,
  OnDestroy,
  OnInit,
  signal,
  SimpleChanges
} from '@angular/core';
import {
  FormControl,
  NgControl,
  RequiredValidator,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';

import { SiFormFieldsetComponent } from '../form-fieldset/si-form-fieldset.component';
import { SiFormContainerComponent } from '../si-form-container/si-form-container.component';
import { SI_FORM_ITEM_CONTROL, SiFormItemControl } from '../si-form-item.control';
import { SiFormValidationErrorMapper } from '../si-form-validation-error.model';
import { SiFormValidationErrorService } from '../si-form-validation-error.service';
import { SiFormFieldNativeControl } from './si-form-field-native.control';

/** @internal */
export interface SiFormError {
  key: string;
  message?: string;
  params: any;
}

@Component({
  selector: 'si-form-item',
  imports: [SiTranslatePipe, NgTemplateOutlet],
  templateUrl: './si-form-item.component.html',
  styleUrl: '../si-form.shared.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.required]': 'required()',
    '[style.--si-form-label-width]': 'labelWidthCssVar()',
    '[class.form-check]': 'fieldControl()?.isFormCheck',
    '[class.form-check-inline]': 'fieldset?.inline()',
    '[class.si-form-input]': '!fieldset'
  }
})
export class SiFormItemComponent
  implements AfterContentInit, AfterContentChecked, OnChanges, OnInit, OnDestroy
{
  /** @deprecated property has longer an effect. SiFormItem detects IDs automatically  */
  @Input() inputId?: string;

  /**
   * The label to be displayed in the form item.
   * It will be translated if a translation key is available.
   */
  readonly label = input<string | null>();

  /**
   * A custom width value to be applied to the label.
   * A value of 0 is allowed as well to visually hide away the label area.
   *
   * Numbers will be converted to pixels.
   * Using numbers is discouraged and might be dropped.
   *
   * @example labelWidth="100px"
   */
  readonly labelWidth = input<string | number>();

  /**
   * @deprecated This input has no effect and can be removed.
   *
   * @defaultValue false
   */
  @Input({ transform: booleanAttribute }) readonly = false;

  /**
   * Disables the automatic error printing. Error printing will be enabled by default in v46.
   *
   * @defaultValue false
   */
  readonly disableErrorPrinting = input(false, { transform: booleanAttribute });

  readonly formErrorMapper = input<SiFormValidationErrorMapper>();

  /**
   * Defines that this form item is required for the overall form to be valid.
   *
   * @defaultValue false
   */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly requiredInput = input(false, { transform: booleanAttribute, alias: 'required' });

  protected readonly fieldControlQuery = contentChild(SI_FORM_ITEM_CONTROL, { descendants: true });
  /** @internal */
  readonly ngControl = contentChild(NgControl, { descendants: true });
  protected readonly controlElementRef = contentChild<NgControl, ElementRef<HTMLElement>>(
    NgControl,
    {
      read: ElementRef,
      descendants: true
    }
  );
  protected readonly requiredValidator = contentChild(RequiredValidator, { descendants: true });

  /** @internal */
  readonly errors = signal<SiFormError[]>([]);

  protected fieldset = inject(SiFormFieldsetComponent, { optional: true });
  protected container = inject(SiFormContainerComponent, { optional: true });

  protected get formItemId(): string | null {
    const fieldControl = this.fieldControl();
    return isSignal(fieldControl?.id) ? (fieldControl.id() ?? null) : (fieldControl?.id ?? null);
  }

  protected get formItemLabelledBy(): string | null {
    const fieldControl = this.fieldControl();
    return isSignal(fieldControl?.labelledby)
      ? (fieldControl.labelledby() ?? null)
      : (fieldControl?.labelledby ?? null);
  }

  protected get formItemErrormessageId(): string | null {
    const fieldControl = this.fieldControl();
    return isSignal(fieldControl?.errormessageId)
      ? (fieldControl?.errormessageId() ?? null)
      : (fieldControl?.errormessageId ?? null);
  }

  protected readonly fieldControl = computed(
    () => this.fieldControlQuery() ?? this.fieldControlNative()
  );

  private validationErrorService = inject(SiFormValidationErrorService);
  private requiredTestControl = new FormControl('');
  private validator?: ValidatorFn | null;
  private previousErrors?: ValidationErrors | null;
  private readonly hasRequiredValidator = signal(false);
  private readonly fieldControlNative = signal<SiFormItemControl | undefined>(undefined);

  protected readonly labelWidthCssVar = computed(() => {
    const labelWidth = this.labelWidth();
    if (typeof labelWidth === 'number') {
      return `${labelWidth}px`;
    }

    return labelWidth;
  });

  protected readonly printErrors = computed(() => {
    return !this.disableErrorPrinting() && !(this.container?.disableErrorPrinting() ?? false);
  });

  /** @internal */
  readonly required = computed(() => this.requiredInput() || this.hasRequiredValidator());

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.formErrorMapper) {
      this.updateValidationMessages();
    }
  }

  ngOnInit(): void {
    this.fieldset?.registerFormItem(this);
  }

  ngAfterContentInit(): void {
    if (!this.fieldControlQuery()) {
      this.fieldControlNative.set(
        SiFormFieldNativeControl.createForElementRef(this.controlElementRef())
      );
    }
  }

  ngAfterContentChecked(): void {
    this.updateRequiredState();
    this.updateValidationMessages();
  }

  ngOnDestroy(): void {
    this.fieldset?.unregisterFormItem(this);
  }

  private updateRequiredState(): void {
    const requiredValidator = this.requiredValidator();
    if (requiredValidator) {
      // the easy case: required validator is applied in the template: <input required>
      this.hasRequiredValidator.set(booleanAttribute(requiredValidator.required));
    } else {
      // No required validator is applied via template, it could still be applied in the code.
      // If validators are applied via code, the validator object will change of controls.
      // So we only need to check for required if the validator object was changed.
      const validator = this.ngControl()?.control?.validator;

      if (this.validator !== validator) {
        this.validator = validator;
        this.requiredTestControl.setValidators(this.validator ?? null);
        this.requiredTestControl.updateValueAndValidity();
        this.hasRequiredValidator.set(this.requiredTestControl.errors?.required ?? false);
      }
    }
  }

  private updateValidationMessages(): void {
    const control = this.ngControl();
    const currentErrors = control?.errors;
    if (this.previousErrors !== currentErrors) {
      if (control && this.printErrors()) {
        this.errors.set(
          this.validationErrorService
            .resolveErrors(
              control.name,
              control.errors,
              this.formErrorMapper(),
              this.container?.formErrorMapper()
            )
            .filter(error => error.message)
        );
        this.previousErrors = currentErrors;
      } else if (this.errors().length) {
        this.errors.set([]);
      }
    }
  }
}
