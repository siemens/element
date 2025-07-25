/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Directive, computed, input } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { SI_FORM_ITEM_CONTROL, SiFormItemControl } from '@siemens/element-ng/form';

@Directive({
  selector: '[siFormlyFormFieldProvider]',
  providers: [{ provide: SI_FORM_ITEM_CONTROL, useExisting: SiFormlyFormFieldProviderDirective }]
})
export class SiFormlyFormFieldProviderDirective implements SiFormItemControl {
  readonly field = input.required<FormlyFieldConfig>();

  readonly id = computed(() => this.field().id);
  readonly labelledby = computed(() => {
    const fieldValue = this.field();
    if (fieldValue.props?.useAriaLabel) {
      return fieldValue.id + '-label';
    } else {
      return undefined;
    }
  });
}
