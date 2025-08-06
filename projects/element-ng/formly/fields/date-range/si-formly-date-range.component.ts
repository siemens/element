/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { SiDateRangeComponent } from '@spike-rabbit/element-ng/datepicker';

@Component({
  selector: 'si-formly-date-range',
  imports: [ReactiveFormsModule, FormlyModule, SiDateRangeComponent],
  templateUrl: './si-formly-date-range.component.html'
})
export class SiFormlyDateRangeComponent extends FieldType<FieldTypeConfig> {}
