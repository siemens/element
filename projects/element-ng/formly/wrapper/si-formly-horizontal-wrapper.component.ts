/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { FieldWrapper, FormlyModule } from '@ngx-formly/core';

@Component({
  selector: 'si-formly-horizontal-wrapper',
  imports: [FormlyModule],
  templateUrl: './si-formly-horizontal-wrapper.component.html'
})
export class SiFormlyHorizontalWrapperComponent extends FieldWrapper {}
