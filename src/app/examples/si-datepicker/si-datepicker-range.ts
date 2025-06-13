/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DateRange, SiDatepickerComponent } from '@siemens/element-ng/datepicker';

@Component({
  selector: 'app-sample',
  templateUrl: './si-datepicker-range.html',
  host: { class: 'p-5' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, SiDatepickerComponent]
})
export class SampleComponent {
  myDateRange: DateRange = {
    start: new Date('2022-03-01'),
    end: new Date('2022-03-03')
  };
}
