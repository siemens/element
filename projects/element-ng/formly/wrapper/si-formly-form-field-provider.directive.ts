/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Directive, OnChanges, computed, input } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { SI_FORM_ITEM_CONTROL, SiFormItemControl } from '@siemens/element-ng/form';

@Directive({
  selector: '[siFormlyFormFieldProvider]',
  providers: [{ provide: SI_FORM_ITEM_CONTROL, useExisting: SiFormlyFormFieldProviderDirective }]
})
export class SiFormlyFormFieldProviderDirective implements SiFormItemControl, OnChanges {
  readonly field = input.required<FormlyFieldConfig>();

  readonly id = computed(() => this.field().id);
  isFormCheck?: boolean;
  readonly labelledby = computed(() => {
    const fieldValue = this.field();
    if (fieldValue.props?.useAriaLabel) {
      return fieldValue.id + '-label';
    } else {
      return undefined;
    }
  });

  ngOnChanges(): void {
    this.isFormCheck = this.field().type === 'checkbox' || this.field().type === 'boolean';
  }
}
