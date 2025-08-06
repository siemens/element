/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiFormItemComponent } from '@spike-rabbit/element-ng/form';
import { SiNumberInputComponent } from '@spike-rabbit/element-ng/number-input';

@Component({
  selector: 'app-sample',
  imports: [FormsModule, SiFormItemComponent, SiNumberInputComponent, JsonPipe],
  templateUrl: './si-number-input.html',
  host: { class: 'p-5' }
})
export class SampleComponent {
  value = 42;
  minValue = 0;
  maxValue = 100;
  stepSize = 1;
  required = true;
  readonly = false;
  disabled = false;
  unit = '°C';
  showButtons = true;
  alignEnd = true;
}
