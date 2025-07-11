/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet } from '@angular/common';
import { booleanAttribute, Component, computed, inject, input } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { Breakpoints, SiResponsiveContainerDirective } from '@siemens/element-ng/resize-observer';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

import { SiFormValidationErrorMapper } from '../si-form-validation-error.model';
import { SiFormValidationErrorService } from '../si-form-validation-error.service';

export interface SiFormValidationError {
  controlName?: string;
  controlNameTranslationKey?: string;
  errorCode: string;
  errorCodeTranslationKey?: string;
  errorParams?: any;
}

@Component({
  selector: 'si-form-container',
  imports: [NgTemplateOutlet, SiResponsiveContainerDirective, SiTranslateModule],
  templateUrl: './si-form-container.component.html',
  styleUrl: './si-form-container.component.scss',
  host: {
    '[style.--si-form-label-width]': 'labelWidth()'
  }
})
export class SiFormContainerComponent<TControl extends { [K in keyof TControl]: AbstractControl }> {
  /**
   * Set the form entity to the container to enable the overall form validation on in
   * the form container edit panel.
   */
  readonly form = input<FormGroup<TControl>>();

  /**
   * A form container in readonly mode is only displaying the form content without ability
   * to change it. The edit panel with typically save and cancel buttons is hidden. Set
   * to true to display the edit panel.
   *
   * @defaultValue false
   */
  readonly readonly = input(false, { transform: booleanAttribute });

  /**
   * The container hosts the form within a siResizeContainer to configure the breakpoint for
   * different screen sizes. Optionally, change the container breakpoints with the contentContainerBreakpoints
   * input.
   */
  readonly contentContainerBreakpoints = input<Breakpoints>();

  /**
   * In some scenarios, one may not want the form container to be responsible for the layout relevant
   * `si-container-[xs|...]` classes, but let this be done by a different, nested component, e.g. by a
   * group box. In these cases, the property should be set to true.
   *
   * @defaultValue false
   */
  readonly disableContainerBreakpoints = input(false, { transform: booleanAttribute });

  /**
   * Every validation error has an errorCode. This map holds translate keys for error codes. The keys can
   * be used to display a translated message for each validation error. The defaults old english readable
   * key defaults for the Angular standard validators of the `Validators` class like `min`, `max` or `required`.
   *
   * Use the input to set your own translate keys for the form validators you need.
   */
  readonly errorCodeTranslateKeyMap = input<
    Map<string, string> | SiFormValidationErrorMapper | undefined
  >();

  /**
   * A map the maps from control names of the form to their translate keys.
   * The initial map is empty and the user is responsible to add the required
   * translate keys.
   *
   * @defaultValue
   * ```
   * new Map<string, string>()
   * ```
   */
  readonly controlNameTranslateKeyMap = input(new Map<string, string>());

  /**
   * Disables the automatic error printing in all nested {@link SiFormItemComponent}. Error printing will be enabled by default in v46.
   *
   * @defaultValue false
   */
  readonly disableErrorPrinting = input(false, { transform: booleanAttribute });

  /**
   * A custom width value to be applied to all labels.
   *
   * @example labelWidth="100px".
   */
  readonly labelWidth = input<string>();

  protected hasParentContainer = !!inject(SiFormContainerComponent, {
    optional: true,
    skipSelf: true
  });
  private errorResolver = inject(SiFormValidationErrorService);

  /** @internal */
  readonly formErrorMapper = computed(() => {
    const map = this.errorCodeTranslateKeyMap();

    let customMapper: SiFormValidationErrorMapper | undefined;
    if (map instanceof Map) {
      customMapper = Object.fromEntries(map.entries());
    } else if (map) {
      customMapper = map;
    }

    return {
      ...customMapper
    };
  });

  /**
   * Indicates whether the user interacted with the form.
   * @returns `true`, if the user selected at least one form element and
   * [blurred]{@link https://developer.mozilla.org/en-US/docs/Web/API/Element/blur_event} by losing focus again
   * (e.g. by setting focus on another element), or by editing the content of a form element.
   * Otherwise `false`.
   */
  get userInteractedWithForm(): boolean {
    const form = this.form();
    return !!form && (form.dirty || form.touched);
  }

  /**
   * Indicates whether content editor message shall be styled as success.
   * @returns `true`, if {@link SiFormContainerComponent.userInteractedWithForm} is true and
   * the form is valid.
   */
  get validFormContainerMessage(): boolean {
    return this.userInteractedWithForm && this.form()!.status === 'VALID';
  }

  /**
   * Indicates whether the content editor message shall be styled as warning.
   * @returns `true`, if {@link SiFormContainerComponent.userInteractedWithForm} is true and
   * the form is invalid.
   */
  get invalidFormContainerMessage(): boolean {
    return this.userInteractedWithForm && this.form()!.status === 'INVALID';
  }

  /**
   * Returns the validation errors of the form's control when the control name is provided. Otherwise,
   * returns all validation errors of the form. Returns an empty arry when no form is available or if
   * the name does not match to a control.
   * @param controlName - An optional name of a control that is part of the form.
   *
   * @deprecated The {@link SiFormItemComponent} is able to display validation errors automatically when `siFormInput` directive is used.
   */
  getValidationErrors(controlName?: string): SiFormValidationError[] {
    const form = this.form();
    if (!form) {
      return [];
    } else if (!controlName) {
      return this.getFormValidationErrorsPrivate(form);
    } else {
      const control = form.get(controlName);
      if (control) {
        return this.getFormValidationErrorsPrivate(control, controlName);
      } else {
        return [];
      }
    }
  }

  protected getControlNameTranslateKey(controlName: string): string | undefined {
    const controlNameTranslateKeyMap = this.controlNameTranslateKeyMap();
    if (!controlNameTranslateKeyMap) {
      return undefined;
    }
    return controlNameTranslateKeyMap.get(controlName) ?? controlName;
  }

  private getFormValidationErrorsPrivate(
    control: AbstractControl,
    controlName?: string
  ): SiFormValidationError[] {
    let errors: SiFormValidationError[] = [];

    // a form must either consist of
    // a) a formgroup (with nested form controls or groups) or
    // b) a single form control
    if (control instanceof FormGroup) {
      const formGroupErrors = this.getFormGroupErrors(control);
      errors = errors.concat(formGroupErrors);
      if (control.controls) {
        Object.keys(control.controls).forEach(key => {
          const formGroupControl = control.controls[key];
          const formGroupControlErrors = this.getFormValidationErrorsPrivate(formGroupControl, key);
          errors = errors.concat(formGroupControlErrors);
        });
      }
    } else if (control instanceof FormControl) {
      errors.push(
        ...this.errorResolver
          .resolveErrors(controlName, control.errors, undefined, this.formErrorMapper())
          .map(error => ({
            controlName,
            errorCode: error.key,
            errorParams: error.params,
            errorCodeTranslationKey: error.message,
            controlNameTranslationKey: controlName
              ? this.getControlNameTranslateKey(controlName)
              : undefined
          }))
      );
    }

    return errors;
  }

  private getFormGroupErrors(formGroup: FormGroup): SiFormValidationError[] {
    return this.errorResolver
      .resolveErrors(null, formGroup.errors, undefined, this.formErrorMapper())
      .map(error => ({
        errorCode: error.key,
        errorParams: error.params,
        errorCodeTranslationKey: error.message
      }));
  }
}
