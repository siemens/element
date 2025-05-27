/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Directive, HostBinding, Input } from '@angular/core';

import { SI_FORM_ITEM_CONTROL, SiFormItemControl } from './si-form-item.control';

/** @deprecated This directive is no longer needed. {@link SiFormItemComponent} will detect native controls automatically. */
@Directive({
  selector: '[siFormItemControl]',
  providers: [{ provide: SI_FORM_ITEM_CONTROL, useExisting: SiFormItemControlInputDirective }]
})
export class SiFormItemControlInputDirective implements SiFormItemControl {
  private static idCounter = 0;

  @Input()
  @HostBinding('id')
  id = `__si-form-element-control-input-${SiFormItemControlInputDirective.idCounter++}`;

  @Input() set type(value: string) {
    this.isFormCheck = value === 'checkbox' || value === 'radio';
    this.formControlClass = this.isFormCheck ? 'form-check-input' : 'form-control';
  }

  @HostBinding('class') protected formControlClass = 'form-control';

  /**
   * Indicate the form item is a checkbox or radio input.
   * @defaultValue false
   */
  isFormCheck = false;

  /** @internal */
  @HostBinding('attr.aria-describedby')
  readonly errormessageId = `${this.id}-errormessage`;
}
