/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import {
  SiSelectComponent,
  SiSelectMultiValueDirective,
  SiSelectSimpleOptionsDirective,
  SiSelectSingleValueDirective
} from '@siemens/element-ng/select';

@Component({
  selector: 'si-formly-select',
  templateUrl: './si-formly-select.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    FormlyModule,
    SiSelectComponent,
    SiSelectSimpleOptionsDirective,
    SiSelectMultiValueDirective,
    SiSelectSingleValueDirective
  ]
})
export class SiFormlySelectComponent extends FieldType<FieldTypeConfig> {}
