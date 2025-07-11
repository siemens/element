/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { FieldArrayType, FormlyModule } from '@ngx-formly/core';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

@Component({
  selector: 'si-formly-array',
  templateUrl: './si-formly-array.component.html',
  imports: [FormlyModule, SiTranslateModule]
})
export class SiFormlyArrayComponent extends FieldArrayType {}
