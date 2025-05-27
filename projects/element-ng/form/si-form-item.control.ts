/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { InjectionToken, Signal } from '@angular/core';

export const SI_FORM_ITEM_CONTROL = new InjectionToken<SiFormItemControl>('si.form-item.control');

/**
 * Common interface for form item controls.
 * Controls that should be connected to {@link SiFormItemComponent} must implement this interface
 * and must be provided using the {@link SI_FORM_ITEM_CONTROL} token.
 */
export interface SiFormItemControl {
  /** The actual id of the control that should be used in the `for` attribute of a label. */
  readonly id?: string | Signal<string | undefined>;

  /**
   * ID that should be assigned to the label element inside the {@link SiFormItemComponent}.
   *
   * If the target control is not of type <i>input</i>, <i>select</i> or <i>button</i>, it cannot be referenced by a label.
   * Instead, aria-labelledby must be used to create a reference to a label.
   * In such a case, an implementation of {@link SiFormItemControl} must provide the id of the label in {@link labelledby}.
   * {@link SiFormItemComponent} will apply the id to the label
   * so that it can be used inside the control to reference it in the aria-labelledby attribute.
   */
  readonly labelledby?: string | Signal<string | undefined> | null;

  /**
   * Generated ID that the {@link SiFormItemComponent} will assign to the element containing the error messages.
   * Implementations of {@link SiFormItemControl} must generate this ID
   * and assign it to the `aria-describedby` attribute of their focusable elements.
   *
   * This property will be required with v48.
   */
  readonly errormessageId?: string | Signal<string | undefined>;

  /** If the control is meant to be used a checkbox. This affects the label positioning. */
  readonly isFormCheck?: boolean;
}
