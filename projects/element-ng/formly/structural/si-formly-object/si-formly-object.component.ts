/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { FieldType, FormlyModule } from '@ngx-formly/core';

@Component({
  selector: 'si-formly-object',
  templateUrl: './si-formly-object.component.html',
  imports: [FormlyModule]
})
export class SiFormlyObjectComponent extends FieldType {}
