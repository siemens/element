/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FieldType, FormlyModule } from '@ngx-formly/core';

@Component({
  selector: 'si-formly-object',
  imports: [FormlyModule],
  templateUrl: './si-formly-object.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiFormlyObjectComponent extends FieldType {}
