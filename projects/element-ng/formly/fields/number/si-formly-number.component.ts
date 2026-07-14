/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { SiNumberInputComponent } from '@siemens/element-ng/number-input';

import { SiValidationErrorIdPipe } from '../../utils';

@Component({
  selector: 'si-formly-number',
  imports: [ReactiveFormsModule, FormlyModule, SiNumberInputComponent, SiValidationErrorIdPipe],
  templateUrl: './si-formly-number.component.html'
})
export class SiFormlyNumberComponent extends FieldType<FieldTypeConfig> {}
