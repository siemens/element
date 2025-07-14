/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { FieldArrayType, FormlyModule } from '@ngx-formly/core';
import { SiTranslatePipe } from '@siemens/element-translate-ng/translate';

@Component({
  selector: 'si-formly-array',
  imports: [FormlyModule, SiTranslatePipe],
  templateUrl: './si-formly-array.component.html'
})
export class SiFormlyArrayComponent extends FieldArrayType {}
