/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import {
  SiPasswordStrengthComponent,
  SiPasswordStrengthDirective
} from '@siemens/element-ng/password-strength';

@Component({
  selector: 'si-formly-password',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    FormlyModule,
    SiPasswordStrengthComponent,
    SiPasswordStrengthDirective
  ],
  templateUrl: './si-formly-password.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiFormlyPasswordComponent extends FieldType<FieldTypeConfig> {
  /*
  Sample config:
  "password.field": {
    "type": "string",
    "title": "Password",
    "widget": {
      "formlyConfig": {
        "type": "password",
        "props": {
          "minLength": 5,
          "upperCase": true,
          "loweCase": true,
          "digits": true,
          "special": true
        }
      }
    }
  }
  */
}
