/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { getLocaleFirstDayOfWeek, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, LOCALE_ID, signal } from '@angular/core';
import {
  DateRange,
  getWeekEndDate,
  getWeekStartDate,
  isSameDate,
  SiDatepickerComponent,
  WeekStart
} from '@siemens/element-ng/datepicker';

@Component({
  selector: 'app-sample',
  imports: [JsonPipe, SiDatepickerComponent],
  templateUrl: './si-datepicker-week-selection.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  readonly local = inject(LOCALE_ID).toString();
  readonly range = signal<DateRange>({ start: undefined, end: undefined });
  readonly weekStart: WeekStart;

  constructor() {
    const dayMap: Partial<Record<number, WeekStart>> = { 0: 'sunday', 6: 'saturday' };
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const firstDay = getLocaleFirstDayOfWeek(this.local);
    this.weekStart = dayMap[firstDay] ?? 'monday';
  }

  onDateRangeChange(range: DateRange | undefined): void {
    if (!range?.start) {
      this.range.set({ start: undefined, end: undefined });
      return;
    }

    const weekStart = getWeekStartDate(range.start, this.weekStart);
    const weekEnd = getWeekEndDate(range.start, this.weekStart);

    // Avoid re-processing when the range already matches the computed week
    if (range.end && isSameDate(range.start, weekStart) && isSameDate(range.end, weekEnd)) {
      return;
    }

    this.range.set({ start: weekStart, end: weekEnd });
  }
}
