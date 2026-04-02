/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  DateRange,
  getWeekEndDate,
  getWeekStartDate,
  isSameDate,
  SiDatepickerComponent
} from '@siemens/element-ng/datepicker';

@Component({
  selector: 'app-sample',
  imports: [JsonPipe, SiDatepickerComponent],
  templateUrl: './si-datepicker-week-selection.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  readonly range = signal<DateRange>({ start: undefined, end: undefined });

  onDateRangeChange(range: DateRange | undefined): void {
    if (!range?.start) {
      this.range.set({ start: undefined, end: undefined });
      return;
    }

    const weekStart = getWeekStartDate(range.start);
    const weekEnd = getWeekEndDate(range.start);

    // Avoid re-processing when the range already matches the computed week
    if (range.end && isSameDate(range.start, weekStart) && isSameDate(range.end, weekEnd)) {
      return;
    }

    this.range.set({ start: weekStart, end: weekEnd });
  }
}
