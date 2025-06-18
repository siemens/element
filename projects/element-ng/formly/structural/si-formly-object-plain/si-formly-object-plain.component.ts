/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { FieldType, FormlyModule } from '@ngx-formly/core';

@Component({
  selector: 'si-formly-object-plain',
  templateUrl: './si-formly-object-plain.component.html',
  imports: [FormlyModule]
})
export class SiFormlyObjectPlainComponent extends FieldType {}
