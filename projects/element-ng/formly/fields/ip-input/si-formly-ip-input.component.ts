/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { SiIp4InputDirective, SiIp6InputDirective } from '@spike-rabbit/element-ng/ip-input';

@Component({
  selector: 'si-formly-ip-address',
  imports: [ReactiveFormsModule, FormlyModule, SiIp4InputDirective, SiIp6InputDirective],
  templateUrl: './si-formly-ip-input.component.html'
})
export class SiFormlyIpInputComponent extends FieldType<FieldTypeConfig> {}
