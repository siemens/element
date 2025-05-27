/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ElementRef } from '@angular/core';

import { SiFormItemControl } from '../si-form-item.control';

/**
 * This will be used by the `si-form-item` to create a form item control if none is provided.
 * This is typically the case for native form controls like `input`, `textarea` and `select`.
 * It allows accessing the control's id and type.
 */
export class SiFormFieldNativeControl implements SiFormItemControl {
  private static idCounter = 0;
  private static readonly supportedTypes = ['INPUT', 'TEXTAREA', 'SELECT', 'METER', 'PROGRESS'];

  static createForElementRef(
    element: ElementRef<HTMLElement> | undefined
  ): SiFormFieldNativeControl | undefined {
    if (!element) {
      return undefined;
    }

    if (!SiFormFieldNativeControl.supportedTypes.includes(element.nativeElement.tagName)) {
      return undefined;
    }

    return new SiFormFieldNativeControl(element.nativeElement);
  }

  private constructor(private readonly element: HTMLElement) {
    if (!element.id) {
      element.id = `__si-form-field-native-control-${SiFormFieldNativeControl.idCounter++}`;
    }

    this.errormessageId = `${this.id}-errormessage`;
    if (element instanceof HTMLInputElement) {
      this.isFormCheck = element.type === 'checkbox' || element.type === 'radio';
    } else {
      this.isFormCheck = false;
    }

    element.setAttribute('aria-describedby', this.errormessageId);
  }

  isFormCheck: boolean;

  get id(): string {
    return this.element?.id;
  }

  set id(value: string) {
    this.element.id = value;
  }

  readonly errormessageId: string;
}
