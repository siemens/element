/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { DatePipe } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  LOCALE_ID,
  model,
  output
} from '@angular/core';
import { isRTL } from '@siemens/element-ng/common';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

import {
  addDaysInRange,
  addMonthsInRange,
  createDate,
  getDayStrings,
  getFirstDateInMonth,
  getLastDateInMonth,
  getWeekEndDate,
  getWeekOfYear,
  getWeekStartDate,
  isAfterMonth,
  isAnotherMonthOrYear,
  isSameDate,
  isSameMonth,
  isSameOrBetween,
  today
} from '../date-time-helper';
import { WeekStart } from '../si-datepicker.model';
import { Cell, SiCalendarBodyComponent } from './si-calendar-body.component';
import { SiCalendarDirectionButtonComponent } from './si-calendar-direction-button.component';
import { DayCompareAdapter } from './si-compare-adapter';
import { SiInitialFocusComponent } from './si-initial-focus.component';

/**
 * Show dates of a single month as table and handles the keyboard interactions.
 * The focusedDate is handled according the keyboard interactions.
 */
@Component({
  selector: 'si-day-selection',
  imports: [
    DatePipe,
    SiCalendarBodyComponent,
    SiCalendarDirectionButtonComponent,
    SiTranslateModule
  ],
  templateUrl: './si-day-selection.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiDaySelectionComponent extends SiInitialFocusComponent {
  /**
   * Indicate whether the week numbers shall be hidden.
   *
   * @defaultValue false
   */
  readonly hideWeekNumbers = input(false, { transform: booleanAttribute });
  /**
   * Defines the starting day of the week. Default is `monday`.
   *
   * @defaultValue 'monday'
   */
  readonly weekStartDay = input<WeekStart>('monday');
  /**
   * The active date, the cell which will receive the focus.
   * @defaultValue calendarUtils.today()
   */
  readonly focusedDate = model.required<Date>();
  /** Today button text */
  readonly todayLabel = input<string>();
  /** Aria label for calendar week column */
  readonly calenderWeekLabel = input<string>();
  /** Emits when the active focused date changed to another month / year, typically during keyboard navigation */
  readonly activeMonthChange = output<Date>();
  /** Emits when the user requests a different to show a different view */
  readonly viewChange = output<'year' | 'month'>();
  /** The translated list of week days. */
  protected readonly days = computed(() => getDayStrings(this.locale, this.weekStartDay()));
  /** The week numbers which are shown as row label */
  protected readonly weekNumbers = computed(() =>
    this.weeks().map(w => getWeekOfYear(w[0].valueRaw, this.weekStartDay()).toString())
  );
  /**
   * The current visible list of calendar days.
   * Every time the focusedDate changes to either another month or year the list will be rebuild.
   */
  protected readonly weeks = computed(() => {
    const focusedDate = this.focusedDate();
    const monthStart = getFirstDateInMonth(focusedDate);
    const monthEnd = getLastDateInMonth(focusedDate);
    /**
     * We start the month with the first day in the week which has the effect that dates are
     * visible which aren't in the active month.
     */
    const startDate = getWeekStartDate(monthStart, this.weekStartDay());
    const minDate = this.minDate();
    const maxDate = this.maxDate();
    const weeks: Cell[][] = [[], [], [], [], [], []];
    let weekIndex = 0;
    for (
      let i = 0, date = new Date(startDate);
      weeks[weeks.length - 1].length < 7;
      i++, date.setDate(date.getDate() + 1)
    ) {
      if (i > 0 && i % 7 === 0) {
        weekIndex++;
      }

      const activeMonth = isSameOrBetween(date, monthStart, monthEnd);
      const isToday = isSameDate(date, today());
      const outOfRange = !isSameOrBetween(date, minDate, maxDate);

      weeks.at(weekIndex)?.push({
        value: date.getDate(),
        disabled: outOfRange,
        ariaLabel: date.toDateString(),
        displayValue: date.getDate().toString(),
        isPreview: !activeMonth,
        isToday,
        valueRaw: createDate(date),
        cssClasses: ['day', activeMonth ? 'si-title-1' : 'si-body-1']
      });
    }
    return weeks;
  });
  /** Compare date based on the current view */
  protected compareAdapter = new DayCompareAdapter();
  /** Disable today button if it is the same month */
  protected readonly isTodayButtonDisabled = computed(() =>
    isSameMonth(today(), this.focusedDate())
  );
  /**
   * Indicate the previous button shall be disabled.
   * This happens when the focusedDate is equal or before the minDate.
   */
  protected readonly isPreviousButtonDisabled = computed(() => {
    const minDate = this.minDate();
    const focusedDate = this.focusedDate();
    return minDate && (isSameMonth(focusedDate, minDate) || isAfterMonth(minDate, focusedDate));
  });
  /**
   * Indicate the next button shall be disabled.
   * This happens when the focusedDate is equal or after the maxDate.
   */
  protected readonly isNextButtonDisabled = computed(() => {
    const maxDate = this.maxDate();
    const focusedDate = this.focusedDate();
    return maxDate && (isSameMonth(focusedDate, maxDate) || isAfterMonth(focusedDate, maxDate));
  });

  private readonly locale = inject(LOCALE_ID).toString();

  protected calendarBodyKeyDown(event: KeyboardEvent): void {
    const isRtl = isRTL();
    switch (event.key) {
      case 'ArrowLeft':
        this.updateFocusedDateByDay(isRtl ? 1 : -1);
        break;
      case 'ArrowRight':
        this.updateFocusedDateByDay(isRtl ? -1 : 1);
        break;
      case 'ArrowUp':
        this.updateFocusedDateByDay(-7);
        break;
      case 'ArrowDown':
        this.updateFocusedDateByDay(7);
        break;
      case 'Home':
        this.updateFocusedDate(getWeekStartDate(this.focusedDate(), this.weekStartDay()));
        break;
      case 'End':
        this.updateFocusedDate(getWeekEndDate(this.focusedDate(), this.weekStartDay()));
        break;
      case 'PageDown':
        this.updateFocusedDateByMonth(1);
        break;
      case 'PageUp':
        this.updateFocusedDateByMonth(-1);
        break;
      case 'Enter':
      case 'Space':
      default:
        // Don't prevent default or focus active cell on keys that we don't explicitly handle.
        return;
    }

    // Prevent unexpected default actions such as form submission.
    event.preventDefault();
  }

  protected updateFocusedDateByDay(offset: number): void {
    this.updateFocusedDate(
      addDaysInRange(this.focusedDate(), offset, this.minDate(), this.maxDate())
    );
  }

  protected updateFocusedDateByMonth(offset: number): void {
    this.updateFocusedDate(
      addMonthsInRange(this.focusedDate(), offset, this.minDate(), this.maxDate())
    );
  }

  protected updateFocusedDate(newDate: Date): void {
    const prevDate = this.focusedDate();
    if (!isSameDate(prevDate, newDate)) {
      this.focusedDate.set(newDate);
      if (isAnotherMonthOrYear(newDate, prevDate)) {
        this.activeMonthChange.emit(newDate);
      }
      this.focusActiveCell();
    }
  }

  /**
   * Update month of focusedDate.
   * @param offset -1 or -1.
   */
  protected setMonthOffset(offset: number): void {
    // Only update emit focusedDate since the focus shall stay on the button.
    const actualMonth = addMonthsInRange(
      this.focusedDate(),
      offset,
      this.minDate(),
      this.maxDate()
    );
    this.focusedDate.set(actualMonth);
    this.activeMonthChange.emit(actualMonth);
  }

  /** Change the focusedDate to today */
  protected goToToday(): void {
    this.focusedDate.set(today());
    this.focusActiveCell();
  }

  protected emitSelectedValue(selected: Date): void {
    if (selected !== this.startDate() || selected !== this.endDate()) {
      this.selectedValueChange.emit(selected);
    }
  }

  protected emitActiveDate(active: Date): void {
    this.focusedDate.set(active);
  }

  protected emitViewChange(view: 'year' | 'month'): void {
    this.viewChange.emit(view);
  }
}
