/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet } from '@angular/common';
import { booleanAttribute, Component, computed, inject, input } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { Breakpoints, SiResponsiveContainerDirective } from '@siemens/element-ng/resize-observer';

import { SiFormValidationErrorMapper } from '../si-form-validation-error.model';

export interface SiFormValidationError {
  controlName?: string;
  controlNameTranslationKey?: string;
  errorCode: string;
  errorCodeTranslationKey?: string;
  errorParams?: any;
}

@Component({
  selector: 'si-form-container',
  imports: [NgTemplateOutlet, SiResponsiveContainerDirective],
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

  protected getControlNameTranslateKey(controlName: string): string | undefined {
    const controlNameTranslateKeyMap = this.controlNameTranslateKeyMap();
    if (!controlNameTranslateKeyMap) {
      return undefined;
    }
    return controlNameTranslateKeyMap.get(controlName) ?? controlName;
  }
}
