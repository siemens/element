/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiTimepickerComponent } from '@spike-rabbit/element-ng/datepicker';

@Component({
  selector: 'app-sample',
  imports: [CommonModule, SiTimepickerComponent, FormsModule],
  templateUrl: './si-timepicker-limits.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  myTime = new Date('2022-01-13T05:00:00.000Z');
  min = new Date('2022-01-10T06:00:00.000Z');
  max = new Date('2022-01-01T09:00:00.000Z');
}
