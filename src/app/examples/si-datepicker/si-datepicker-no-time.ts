/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiDatepickerComponent } from '@siemens/element-ng/datepicker';

@Component({
  selector: 'app-sample',
  templateUrl: './si-datepicker-no-time.html',
  host: { class: 'p-5' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, SiDatepickerComponent]
})
export class SampleComponent {
  myDate = new Date('2022-03-12T05:00:00.000Z');
}
