/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiTimepickerComponent } from '@siemens/element-ng/datepicker';

@Component({
  selector: 'app-sample',
  imports: [CommonModule, SiTimepickerComponent, FormsModule],
  templateUrl: './si-timepicker.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  mytime = new Date('2022-01-12T05:00:00.000Z');
  showSeconds = false;
  readonly = false;
  disabled = false;
}
