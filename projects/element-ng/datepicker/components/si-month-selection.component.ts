/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  input,
  model,
  OnChanges,
  output,
  SimpleChanges
} from '@angular/core';
import { isRTL } from '@siemens/element-ng/common';

import {
  addMonthsInRange,
  createDate,
  getFirstDateInYear,
  isAfterYear,
  isAnotherYear,
  isSameYear,
  today as getToday
} from '../date-time-helper';
import { Cell, SiCalendarBodyComponent } from './si-calendar-body.component';
import { SiCalendarDirectionButtonComponent } from './si-calendar-direction-button.component';
import { MonthCompareAdapter } from './si-compare-adapter';
import { SiInitialFocusComponent } from './si-initial-focus.component';

/**
 * Show months of a single year as table and handles the keyboard interactions.
 * The focus and focusedDate is handled according the keyboard interactions.
 */
@Component({
  selector: 'si-month-selection',
  imports: [SiCalendarDirectionButtonComponent, SiCalendarBodyComponent, DatePipe],
  templateUrl: './si-month-selection.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiMonthSelectionComponent extends SiInitialFocusComponent implements OnChanges {
  /**
   * The translated list of months.
   *
   * @defaultValue []
   */
  readonly months = input<string[]>([]);
  /**
   * The active date, the cell which will receive the focus.
   */
  readonly focusedDate = model.required<Date>();
  /** Emits when the active focused date is changed to another month / year, typically during keyboard navigation. */
  readonly activeMonthChange = output<Date>();
  /** Emits when the user requests a different to show a different view. */
  readonly viewChange = output<'year'>();
  /** Listen Escape event to switch view back */
  @HostListener('keydown.Escape', ['$event']) triggerEsc(event: KeyboardEvent): void {
    this.selectedValueChange.emit(null);
    event.preventDefault();
    event.stopPropagation(); // Prevents the overlay from closing.
  }
  /**
   * The current visible list of calendar months.
   * Every time the focusedDate changes to another year the list will update.
   */
  protected monthCells: Cell[][] = [];
  protected compareAdapter = new MonthCompareAdapter();
  /** Number of column before the row is wrapped */
  private readonly columnCount = 2;

  /**
   * Indicate the previous button shall be disabled.
   * This happens when the focusedDate is equal or before the minDate.
   */
  protected readonly isPreviousButtonDisabled = computed(() => {
    const minDate = this.minDate();
    const focusedDate = this.focusedDate();
    return minDate && (isSameYear(focusedDate, minDate) || isAfterYear(minDate, focusedDate));
  });

  /**
   * Indicate the next button shall be disabled.
   * This happens when the focusedDate is equal or after the maxDate.
   */
  protected readonly isNextButtonDisabled = computed(() => {
    const maxDate = this.maxDate();
    const focusedDate = this.focusedDate();
    return maxDate && (isSameYear(focusedDate, maxDate) || isAfterYear(focusedDate, maxDate));
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.maxDate ||
      changes.minDate ||
      changes.maxMonth ||
      changes.minMonth ||
      changes.focusedDate
    ) {
      this.initView();
    }
  }

  protected calendarBodyKeyDown(event: KeyboardEvent): void {
    const isRtl = isRTL();
    switch (event.key) {
      case 'ArrowLeft':
        this.updateFocusedDate(isRtl ? 1 : -1);
        break;
      case 'ArrowRight':
        this.updateFocusedDate(isRtl ? -1 : 1);
        break;
      case 'ArrowUp':
        this.updateFocusedDate(-1 * this.columnCount);
        break;
      case 'ArrowDown':
        this.updateFocusedDate(this.columnCount);
        break;
      case 'Escape':
        this.selectedValueChange.emit(null);
        event.preventDefault();
        event.stopPropagation(); // Prevents the overlay from closing.
        return;
      case 'Enter':
      case 'Space':
      default:
        // Don't prevent default or focus active cell on keys that we don't explicitly handle.
        return;
    }

    // Prevent unexpected default actions such as form submission.
    event.preventDefault();
  }

  protected updateFocusedDate(offset: number): void {
    const prevDate = this.focusedDate();
    const newDate = addMonthsInRange(prevDate, offset, this.minDate(), this.maxDate());
    this.focusedDate.set(newDate);
    if (!this.compareAdapter.isEqual(prevDate, newDate)) {
      // Synchronize focusedDate with year view
      this.focusActiveCell();
      this.emitActiveMonthChange(newDate, prevDate);
    }
  }
  /**
   * Add offset to year and update focusedDate.
   */
  protected setYearOffset(offset: number): void {
    const prevDate = this.focusedDate();
    const newActive = createDate(prevDate);
    newActive.setFullYear(newActive.getFullYear() + offset);
    this.focusedDate.set(newActive);
    this.emitActiveMonthChange(newActive, prevDate);
  }

  protected emitSelectedValue(selected: Date): void {
    this.selectedValueChange.emit(selected);
  }

  protected emitFocusedDate(focused: Date): void {
    // Take over the current day on month changes
    focused.setDate(this.focusedDate().getDate());
    this.focusedDate.set(focused);
  }

  protected emitActiveMonthChange(focus: Date, prevFocus: Date): void {
    if (isAnotherYear(focus, prevFocus)) {
      this.activeMonthChange.emit(focus);
    }
  }

  protected emitViewChange(): void {
    this.viewChange.emit('year');
  }

  /**
   * Initialize view based on the focusedDate.
   */
  private initView(): void {
    this.monthCells = [];
    let row: Cell[] = [];

    // The cell date object needs to be the first to prevent that we jump to the next month when
    // setting the month. For example the focusedDate is 31. setting february would result in the
    // 3. March.
    const startDate = getFirstDateInYear(this.focusedDate());
    const today = getToday();
    const months = this.months();
    for (let i = 0; i <= 11; i++) {
      if (i > 0 && i % this.columnCount === 0) {
        this.monthCells.push(row);
        row = [];
      }
      const date = new Date(startDate);
      date.setMonth(i);
      const isToday = this.compareAdapter.isEqual(date, today);
      const isDisabled = !this.compareAdapter.isEqualOrBetween(
        date,
        this.minDate(),
        this.maxDate()
      );

      row.push({
        value: date.getDate(),
        disabled: isDisabled,
        ariaLabel: `${months[date.getMonth()]} ${this.focusedDate().getFullYear()}`,
        displayValue: months[date.getMonth()],
        isPreview: false,
        isToday,
        valueRaw: createDate(date),
        cssClasses: ['month', 'si-title-1', 'text-truncate']
      });
    }
    this.monthCells.push(row);
  }
}
