/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiFormItemComponent } from '@siemens/element-ng/form';
import {
  SiNumberInputDirective,
  SiSpinnerButtonsComponent
} from '@siemens/element-ng/number-input';

@Component({
  selector: 'app-sample',
  imports: [
    FormsModule,
    SiFormItemComponent,
    SiNumberInputDirective,
    SiSpinnerButtonsComponent,
    JsonPipe
  ],
  templateUrl: './si-number-input-next.html',
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
