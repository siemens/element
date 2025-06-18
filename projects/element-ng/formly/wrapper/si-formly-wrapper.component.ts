/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { FieldWrapper, FormlyModule } from '@ngx-formly/core';
import { SiFormItemComponent } from '@siemens/element-ng/form';

import { SiFormlyFormFieldProviderDirective } from './si-formly-form-field-provider.directive';

@Component({
  selector: 'si-formly-wrapper',
  templateUrl: './si-formly-wrapper.component.html',
  imports: [SiFormItemComponent, FormlyModule, SiFormlyFormFieldProviderDirective]
})
export class SiFormlyWrapperComponent extends FieldWrapper {
  protected get label(): string | undefined {
    return this.props.label && this.props.hideLabel !== true ? this.props.label : undefined;
  }

  protected get labelWidth(): number | undefined {
    return this.props.labelWidth;
  }
}
