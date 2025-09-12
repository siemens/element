/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FieldWrapper, FormlyModule } from '@ngx-formly/core';
import { SiFormFieldsetComponent } from '@siemens/element-ng/form';

@Component({
  selector: 'si-formly-fieldset',
  imports: [FormlyModule, SiFormFieldsetComponent],
  templateUrl: './si-formly-fieldset.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiFormlyFieldsetComponent extends FieldWrapper {
  protected get label(): string | undefined {
    return this.props.label && this.props.hideLabel !== true ? this.props.label : undefined;
  }

  protected get labelWidth(): string | undefined {
    return this.props.labelWidth ? this.props.labelWidth + 'px' : undefined;
  }
}
