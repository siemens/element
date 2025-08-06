/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiDatepickerComponent } from '@spike-rabbit/element-ng/datepicker';

@Component({
  selector: 'app-sample',
  imports: [CommonModule, SiDatepickerComponent],
  templateUrl: './si-datepicker-no-time.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  myDate = new Date('2022-03-12T05:00:00.000Z');
}
