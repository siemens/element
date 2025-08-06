/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  model,
  OnChanges,
  output,
  signal,
  SimpleChanges
} from '@angular/core';
import { isRTL } from '@spike-rabbit/element-ng/common';

import {
  addYearsInRange,
  getFirstDateInYear,
  minDate as getMinDate,
  isBetween,
  today as getToday,
  createDate
} from '../date-time-helper';
import { Cell, SiCalendarBodyComponent } from './si-calendar-body.component';
import { SiCalendarDirectionButtonComponent } from './si-calendar-direction-button.component';
import { YearCompareAdapter } from './si-compare-adapter';
import { SiInitialFocusComponent } from './si-initial-focus.component';

/**
 * Show months of a single year as table and handles the keyboard interactions.
 * The focus and focusedDate is handled according the keyboard interactions.
 */
@Component({
  selector: 'si-year-selection',
  imports: [SiCalendarDirectionButtonComponent, SiCalendarBodyComponent, DatePipe],
  templateUrl: './si-year-selection.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiYearSelectionComponent extends SiInitialFocusComponent implements OnChanges {
  /**
   * The active date, the cell which will receive the focus.
   */
  readonly focusedDate = model.required<Date>();
  /** Emits when the active focused date changed to another month / year, typically during keyboard navigation. */
  readonly yearRangeChange = output<Date[]>();
  /** Listen Escape event to switch view back */
  @HostListener('keydown.Escape', ['$event'])
  triggerEsc(event: Event): void {
    this.selectedValueChange.emit(null);
    event.preventDefault();
    event.stopPropagation(); // Prevents the overlay from closing.
  }
  /** Number of column before the row is wrapped */
  private readonly columnCount = 3;
  /** The number of years which shall be displayed, this number should be even and dividable by columnCount */
  private readonly yearsToDisplay = 18;
  /** Lower windows bound for displayed year range */
  protected readonly fromYear = signal<Date | undefined>(undefined);
  /** Upper windows bound for displayed year range */
  protected readonly toYear = signal<Date | undefined>(undefined);
  /**
   * The current visible list of calendar years.
   * Every time the focusedDate changes to another year the list will be rebuilt.
   */
  protected yearCells: Cell[][] = [];
  protected compareAdapter = new YearCompareAdapter();
  /** Is previous button disabled based on the minDate. */
  protected readonly isPreviousButtonDisabled = computed(() => {
    const minDate = this.minDate();
    const minMonth = this.minMonth();
    if (!minDate && !minMonth) {
      return false;
    }
    const min = getMinDate(minDate, minMonth)!;
    return (
      this.compareAdapter.isEqual(this.fromYear()!, min) ||
      this.compareAdapter.isAfter(min, this.fromYear()!)
    );
  });
  /** Is next button  disabled  based on the maxDate */
  protected readonly isNextButtonDisabled = computed(() => {
    const maxDate = this.maxDate();
    if (!maxDate) {
      return false;
    }
    return (
      this.compareAdapter.isEqual(this.toYear()!, maxDate) ||
      this.compareAdapter.isAfter(this.toYear()!, maxDate)
    );
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.startDate || changes.focusedDate || changes.maxDate || changes.minDate) {
      this.initView();
    }
  }

  protected calendarBodyKeyDown(event: KeyboardEvent): void {
    const isRtl = isRTL();
    const oldActiveDate = this.focusedDate();
    switch (event.key) {
      case 'ArrowLeft':
        this.setYearOffset(isRtl ? 1 : -1);
        break;
      case 'ArrowRight':
        this.setYearOffset(isRtl ? -1 : 1);
        break;
      case 'ArrowUp':
        this.setYearOffset(-1 * this.columnCount);
        break;
      case 'ArrowDown':
        this.setYearOffset(this.columnCount);
        break;
      case 'PageUp':
        this.setYearOffset(-1 * (oldActiveDate.getFullYear() - this.fromYear()!.getFullYear()));
        break;
      case 'PageDown':
        this.setYearOffset(this.toYear()!.getFullYear() - oldActiveDate.getFullYear());
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

    if (!this.compareAdapter.isEqual(oldActiveDate, this.focusedDate())) {
      this.focusActiveCell();
    }
    // Prevent unexpected default actions such as form submission.
    event.preventDefault();
  }

  /**
   * Change the active date and the range of displayed years.
   * The windowOffset control the amount of ranges the view shall move forward or backward.
   * The number of displayed years ia controlled by yearsToDisplay.
   */
  protected changeVisibleYearRange(windowOffset: number): void {
    const offset = windowOffset * this.yearsToDisplay;
    this.setYearOffset(offset);
  }

  protected emitSelectedValue(selected: Date): void {
    this.selectedValueChange.emit(selected);
  }

  /**
   * Determine the year range start and end year.
   * - Based on the active date this function will find the start and
   * ending year of the current displayed range.
   * - In case the focusedDate is either before or after the current range the
   * start and end year will move the entire window (yearsToDisplay)
   */
  private initYearRange(): void {
    // Did we exceed the display current displayed year range
    let changed = false;
    const focusedDate = this.focusedDate();
    const fromYear = this.fromYear();
    const toYear = this.toYear();
    if (!fromYear || !toYear) {
      const start = focusedDate.getFullYear() - this.yearsToDisplay / 2;
      this.fromYear.set(new Date(start, 0, 1));
      this.toYear.set(new Date(start + this.yearsToDisplay - 1, 0, 1));
      changed = true;
    } else if (this.compareAdapter.isAfter(focusedDate, toYear)) {
      // Change window forward
      const rangeDistance = Math.floor(
        Math.abs(focusedDate.getFullYear() - fromYear.getFullYear()) / this.yearsToDisplay
      );
      const newFromYear = fromYear.getFullYear() + rangeDistance * this.yearsToDisplay;

      this.fromYear.set(new Date(newFromYear, 0, 1));
      this.toYear.set(new Date(newFromYear + this.yearsToDisplay - 1, 0, 1));
      changed = true;
    } else if (this.compareAdapter.isAfter(fromYear, focusedDate)) {
      // Change window backwards
      const rangeDistance = Math.ceil(
        Math.abs(focusedDate.getFullYear() - fromYear.getFullYear()) / this.yearsToDisplay
      );
      const newFromYear = fromYear.getFullYear() - rangeDistance * this.yearsToDisplay;

      this.fromYear.set(new Date(newFromYear, 0, 1));
      this.toYear.set(new Date(newFromYear + this.yearsToDisplay - 1, 0, 1));
      changed = true;
    }

    if (changed) {
      this.yearRangeChange.emit([this.fromYear()!, this.toYear()!]);
    }
  }

  /**
   * Initialize view based on the focusedDate.
   */
  private initView(): void {
    // Initial year limits
    this.initYearRange();

    this.yearCells = [];
    let row: Cell[] = [];

    // The cell date object needs to be the first to prevent that we jump to the next month when
    // setting the month. For example the focusedDate is 31. setting february would result in the
    // 3. March.
    const startDate = getFirstDateInYear(this.fromYear()!);
    const today = getToday();
    for (let i = 0; i < this.yearsToDisplay; i++) {
      if (i > 0 && i % this.columnCount === 0) {
        this.yearCells.push(row);
        row = [];
      }

      const date = createDate(startDate);
      date.setFullYear(date.getFullYear() + i);
      const isToday = this.compareAdapter.isEqual(date, today);
      const isDisabled = !this.compareAdapter.isEqualOrBetween(
        date,
        this.minDate(),
        this.maxDate()
      );
      const year = date.getFullYear().toString();
      row.push({
        value: date.getDate(),
        disabled: isDisabled,
        ariaLabel: year,
        displayValue: year,
        isPreview: false,
        isToday,
        valueRaw: createDate(date),
        cssClasses: ['year', 'si-title-1']
      });
    }
    this.yearCells.push(row);
  }

  /**
   * Add offset to year and update focusedDate.
   * If the new year is outside min/max date the year will set to the closest year in range.
   */
  private setYearOffset(offset: number): void {
    const newActive = addYearsInRange(this.focusedDate(), offset, this.minDate(), this.maxDate());
    this.focusedDate.set(newActive);
    if (!this.fromYear() || !isBetween(this.focusedDate(), this.fromYear(), this.toYear())) {
      // Re-calc years view
      this.initView();
    }
  }
}
