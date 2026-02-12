/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { SiDateRangeComponent } from '@siemens/element-ng/datepicker';

import { SiValidationErrorIdPipe } from '../../utils';

@Component({
  selector: 'si-formly-date-range',
  imports: [ReactiveFormsModule, FormlyModule, SiDateRangeComponent, SiValidationErrorIdPipe],
  templateUrl: './si-formly-date-range.component.html'
})
export class SiFormlyDateRangeComponent extends FieldType<FieldTypeConfig> {}
