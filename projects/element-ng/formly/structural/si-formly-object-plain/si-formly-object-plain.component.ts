/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { FieldType, FormlyModule } from '@ngx-formly/core';

@Component({
  selector: 'si-formly-object-plain',
  imports: [FormlyModule],
  templateUrl: './si-formly-object-plain.component.html'
})
export class SiFormlyObjectPlainComponent extends FieldType {}
