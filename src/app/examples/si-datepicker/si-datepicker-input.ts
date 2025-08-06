/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  SiDatepickerDirective,
  SiCalendarButtonComponent
} from '@spike-rabbit/element-ng/datepicker';
import { SiFormItemComponent } from '@spike-rabbit/element-ng/form';

@Component({
  selector: 'app-sample',
  imports: [
    CommonModule,
    FormsModule,
    SiDatepickerDirective,
    SiCalendarButtonComponent,
    SiFormItemComponent
  ],
  templateUrl: './si-datepicker-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  date = new Date('2022-03-12');
  validationDate = new Date('2022-03-12');
  minDate = new Date('2022-03-12T05:30:00');
  maxDate = new Date('2022-06-12T18:00:00');
}
