/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { getLocaleFirstDayOfWeek, WeekDay } from '@angular/common';
import {
  AfterViewInit,
  booleanAttribute,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  input,
  LOCALE_ID,
  model,
  OnChanges,
  OnInit,
  signal,
  SimpleChange,
  SimpleChanges,
  viewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiTranslateModule, TranslatableString } from '@siemens/element-translate-ng/translate';

import { Cell } from './components/si-calendar-body.component';
import { SiDaySelectionComponent } from './components/si-day-selection.component';
import { SiMonthSelectionComponent } from './components/si-month-selection.component';
import { SiYearSelectionComponent } from './components/si-year-selection.component';
import {
  changeDay,
  createDate,
  getDateSameOrBetween,
  getDateWithoutTime,
  getLocaleMonthNames,
  isAfter,
  isSameDate,
  isSameOrBetween,
  isValid,
  today
} from './date-time-helper';
import { DatepickerConfig, DateRange, WeekStart } from './si-datepicker.model';
import { SiTimepickerComponent } from './si-timepicker.component';

let idCounter = 1;

/**
 * Choose which view shall be shown.
 * @internal
 */
type ViewType = 'week' | 'month' | 'year' | undefined;

export type RangeType = 'START' | 'END' | undefined;

@Component({
  selector: 'si-datepicker',
  templateUrl: './si-datepicker.component.html',
  styleUrl: './si-datepicker.component.scss',
  imports: [
    SiYearSelectionComponent,
    SiMonthSelectionComponent,
    SiDaySelectionComponent,
    SiTimepickerComponent,
    FormsModule,
    SiTranslateModule
  ]
})
export class SiDatepickerComponent implements OnInit, OnChanges, AfterViewInit {
  private readonly locale = inject(LOCALE_ID).toString();
  /**
   * The date which is currently focused
   * Compare to the selected date or range the calendar requires to have one element to focus.
   */
  readonly focusedDate = model<Date>();
  /**
   * The selected date of the datepicker. Use for
   * initialization and for bidirectional binding.
   */
  readonly date = model<Date>();
  /**
   * The selected date range of the datepicker. Use for
   * initialization and for bidirectional binding.
   */
  readonly dateRange = model<DateRange | undefined>();
  /** @internal */
  readonly dateRangeRole = input<RangeType>();
  /**
   * Set initial focus to calendar body.
   *
   * @defaultValue false
   */
  readonly initialFocus = input(false);
  /**
   * Disabled the optional visible time picker.
   *
   * @defaultValue false
   */
  readonly disabledTime = model(false);
  /**
   * Object to configure the datepicker.
   *
   * @defaultValue
   * ```
   * {}
   * ```
   */
  readonly config = model<DatepickerConfig>({});
  /**
   * Aria label for the previous button. Needed for a11y.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_DATEPICKER.PREVIOUS:Previous`
   * ```
   */
  readonly previousLabel = input<TranslatableString>($localize`:@@SI_DATEPICKER.PREVIOUS:Previous`);
  /**
   * Aria label for the next button. Needed for a11y.
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_DATEPICKER.NEXT:Next`
   * ```
   */
  readonly nextLabel = input<TranslatableString>($localize`:@@SI_DATEPICKER.NEXT:Next`);
  /**
   * Aria label for week number column
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_DATEPICKER.CALENDAR_WEEK_LABEL:Calendar week`
   * ```
   */
  readonly calenderWeekLabel = input<TranslatableString>(
    $localize`:@@SI_DATEPICKER.CALENDAR_WEEK_LABEL:Calendar week`
  );
  /**
   * Enable/disable 12H mode in timepicker. Defaults to locale
   *
   * @defaultValue undefined
   */
  readonly time12h = input<boolean | undefined, unknown>(undefined, {
    transform: booleanAttribute
  });
  /**
   * Use this to force date range operation to select either start date or end date.
   *
   * @defaultValue 'START'
   */
  readonly rangeType = model<RangeType>('START');

  /**
   * Optional input to control the minimum month the datepicker can show and the user can navigate.
   * The `minMonth` can be larger than the `minDate` This option enables the usage of multiple
   * datepickers next to each other while the more left calendar always
   * shows a earlier month the the more right one.
   * @internal
   */
  readonly minMonth = input<Date>();
  /**
   * Optional input to control the maximum month the datepicker can show and the user can navigate.
   * The `maxMonth` can be smaller than the `maxDate` This option enables the usage of multiple
   * datepickers next to each other while the more left calendar always
   * shows a earlier month the the more right one.
   * @internal
   */
  readonly maxMonth = input<Date>();
  /**
   * Option to hide the time switch.
   *
   * @defaultValue false
   */
  readonly hideTimeToggle = input(false);
  /** @internal */
  readonly hideCalendar = input(false);
  /**
   * Optional timepicker label.
   */
  readonly timepickerLabel = input<string>();

  protected get startDate(): Date | undefined {
    return this.config().enableDateRange ? this.dateRange()?.start : this.date();
  }

  protected get endDate(): Date | undefined {
    return this.config().enableDateRange ? this.dateRange()?.end : undefined;
  }
  /**
   * Returns the date object if not range selection is enabled. Otherwise, if
   * the date range role is 'END', the date range end date is returned. If
   * date range role is not 'END', the date range start date is returned.
   */
  private getRelevantDate(): Date | undefined {
    return !this.config().enableDateRange
      ? this.date()
      : this.dateRangeRole() === 'END'
        ? this.dateRange()?.end
        : this.dateRange()?.start;
  }

  private readonly defaultDisabledTimeText = $localize`:@@SI_DATEPICKER.DISABLED_TIME_TEXT:Ignore time`;
  private readonly defaultEnableTimeText = $localize`:@@SI_DATEPICKER.ENABLED_TIME_TEXT:Consider time`;

  protected readonly includeTimeLabel = computed(() =>
    this.disabledTime()
      ? (this.config().disabledTimeText ?? this.defaultDisabledTimeText)
      : (this.config().enabledTimeText ?? this.defaultEnableTimeText)
  );

  protected get weekStartDay(): WeekStart {
    return this.config().weekStartDay ?? this.localeWeekStart;
  }

  protected get hideWeekNumbers(): boolean {
    return this.config().hideWeekNumbers ?? false;
  }

  /**
   * The active view
   */
  protected readonly view = signal<ViewType>('week');
  /**
   * Get the current shown view.
   */
  private readonly activeView = computed(() => {
    switch (this.view()) {
      case 'month':
        return this.monthSelection();
      case 'year':
        return this.yearSelection();
      default:
        return this.daySelection();
    }
  });

  protected readonly actualFocusedDate = computed(() => this.focusedDate() ?? today());
  protected readonly requireFocus = signal(this.initialFocus());
  /** When the user switch from the year or month view via keyboard selection we force the focus. */
  protected readonly forceFocus = computed(() => this.requireFocus() || this.initialFocus());
  protected months: string[] = [];
  protected switchId = `__si-datepicker-switch-id-${idCounter++}`;
  protected timepickerId = `__si-datepicker-timepicker-id-${idCounter++}`;

  /**
   * Configuration which view shall be shown after year selection,
   * when onlyMonthSelection is enabled the month view is shown otherwise the week view.
   */
  protected yearViewSwitchTo: 'month' | 'week' = 'week';
  protected monthViewSwitchTo: 'month' | 'week' = 'week';
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly localeWeekStart: WeekStart;
  /**
   * Date object to track and change the time. Keeping time and date
   * in separate objects to not change the date when flipping time.
   * After change, a new date object is created with an adapted time.
   */
  protected time?: Date;
  /**
   * Used to hold the last time when setting the time to disabled.
   * Value will be reset on enabling the time again.
   */
  private previousTime?: Date;

  private readonly timePicker = viewChild(SiTimepickerComponent);
  /** Reference to the current day selection component. Shown when view === 'week' */
  private readonly daySelection = viewChild(SiDaySelectionComponent);
  /** Reference to the current month selection component. Shown when view === 'month' */
  private readonly monthSelection = viewChild(SiMonthSelectionComponent);
  /** Reference to the current year selection component. Shown when view === 'year' */
  private readonly yearSelection = viewChild(SiYearSelectionComponent);

  /**
   * The cell which which has the mouse hover.
   * @internal
   */
  readonly activeHover = model<Cell>();

  constructor() {
    this.initCalendarLabels();

    const weekStart = getLocaleFirstDayOfWeek(this.locale);
    this.localeWeekStart =
      weekStart === WeekDay.Sunday
        ? 'sunday'
        : weekStart === WeekDay.Saturday
          ? 'saturday'
          : 'monday';
  }

  ngOnChanges(changes: SimpleChanges): void {
    const config = this.config();
    if (changes.date && !config.enableDateRange) {
      if (this.date() && !isValid(this.date())) {
        this.date.set(undefined);
      }
      const date = this.date();
      if (date) {
        if (changes.date.isFirstChange()) {
          this.previousTime = new Date(date);
          this.time = date;
        }
        if (this.time?.getTime() !== date?.getTime()) {
          this.time = date;
        }
        this.focusedDate.set(date);
      }
    }

    if (changes.config?.currentValue?.disabledTime) {
      this.disabledTime.set(changes.config?.currentValue?.disabledTime);
      this.onDisabledTimeChanged();
    }

    if (changes.config?.firstChange) {
      if (config.onlyMonthSelection) {
        this.yearViewSwitchTo = 'month';
        this.monthViewSwitchTo = 'month';
        this.view.set('month');
      }
    }

    // Date-range input field has changed
    if (changes.dateRange) {
      // Ensure the dateRange object only contain valid start/end dates
      const dateRange = this.dateRange();
      if (dateRange) {
        if (!isValid(dateRange?.start)) {
          dateRange!.start = undefined;
        }
        if (!isValid(dateRange?.end)) {
          dateRange!.end = undefined;
        }
      }

      // Only one calendar is used when no dateRangeRole is available.
      const dateRangeRole = this.dateRangeRole();
      if (!dateRangeRole) {
        const previous: DateRange | undefined = changes.dateRange.previousValue;
        if (dateRange?.end && !isSameDate(dateRange.end, previous?.end)) {
          this.focusedDate.set(dateRange.end);
        }
        if (dateRange?.start && !isSameDate(dateRange.start, previous?.start)) {
          this.focusedDate.set(dateRange!.start);
        }
      } else {
        // Date range selection with two calendars
        const newDate = dateRangeRole === 'START' ? dateRange?.start : dateRange?.end;

        if (newDate && changes.dateRange.isFirstChange()) {
          this.previousTime = new Date(newDate);
          this.time = newDate;
        }
      }
    }
    if (
      changes.minMonth?.currentValue &&
      isAfter(changes.minMonth.currentValue, this.actualFocusedDate())
    ) {
      this.focusedDate.set(changes.minMonth.currentValue);
    }
    if (
      changes.maxMonth?.currentValue &&
      isAfter(this.actualFocusedDate(), changes.maxMonth.currentValue)
    ) {
      this.focusedDate.set(changes.maxMonth.currentValue);
    }
  }

  ngOnInit(): void {
    const config = this.config();
    const dateRange = this.dateRange();
    const dateRangeRole = this.dateRangeRole();
    if (config.enableDateRange && this.rangeType() === 'END' && dateRange?.end && !dateRangeRole) {
      // The user chose to trigger the datepicker from the date-range end, in this
      // case we
      this.focusedDate.set(dateRange.end);
    } else if (config.enableDateRange && dateRangeRole === 'START') {
      const maxMonth = config?.onlyMonthSelection ? this.maxMonth() : config.maxDate;
      this.focusedDate.set(
        getDateSameOrBetween(
          dateRange?.start ? dateRange!.start : (this.focusedDate() ?? today()),
          config.minDate,
          maxMonth
        )
      );
    } else if (config.enableDateRange && dateRangeRole === 'END') {
      const minMonth = config?.onlyMonthSelection ? this.minMonth() : config.minDate;
      this.focusedDate.set(
        getDateSameOrBetween(
          dateRange?.end ? dateRange!.end : (this.focusedDate() ?? today()),
          minMonth,
          config.maxDate
        )
      );
    } else {
      this.focusedDate.set(
        getDateSameOrBetween(
          isValid(this.startDate) ? this.startDate : (this.focusedDate() ?? today()),
          config.minDate,
          config.maxDate
        )
      );
    }
  }

  ngAfterViewInit(): void {
    // After the view is created the first time we want that the children components set
    // the focus to the calendarBody. Means when we select a date in month-selection,
    // the day selection shall focus automatically the day in calendarBody.
    setTimeout(() => this.requireFocus.set(true));
  }

  /** Initialize day and month labels */
  private initCalendarLabels(): void {
    this.months = getLocaleMonthNames(this.locale.toString());
  }

  /**
   * Validates and sets a new date to the this.date model object of this component
   * and fires the related events. The model object shall not be updated elsewhere
   * with a new date object. Shall only be called on simple date selection and not
   * on date range selection.
   *
   * @param newDate - The new date to be set.
   */
  private setDate(newDate: Date): void {
    const dateWithoutTime = getDateWithoutTime(newDate);
    const config = this.config();
    const validForMinDate = !(
      config?.minDate && dateWithoutTime < getDateWithoutTime(config.minDate)
    );
    const configValue = this.config();
    const validForMaxDate = !(
      configValue?.maxDate && dateWithoutTime > getDateWithoutTime(configValue.maxDate)
    );
    const date = this.date();
    if (date !== newDate && validForMinDate && validForMaxDate) {
      const previousValue = date;
      this.date.set(newDate);
      // eslint-disable-next-line @angular-eslint/no-lifecycle-call
      this.ngOnChanges({
        date: new SimpleChange(previousValue, date, previousValue === undefined)
      });
      //this.dateChange.emit(date);
    } else if (!validForMinDate || !validForMaxDate) {
      // eslint-disable-next-line @angular-eslint/no-lifecycle-call
      this.ngOnChanges({ date: new SimpleChange(undefined, date, true) });
    }

    if (config.enableTimeValidation && this.timePicker() && (config.minDate || config.maxDate)) {
      this.validateTime(newDate);
    }

    this.cdRef.markForCheck();
  }

  /**
   * Validates and sets the new date range to the dateRange model
   * object.
   * @param newDateRange - The new range to be set.
   * @returns True if the new range is valid and set. Otherwise false.
   */
  private setDateRange(newDateRange: DateRange): boolean {
    const config = this.config();
    if (newDateRange.start) {
      const isValidRange = isSameOrBetween(newDateRange.start, config?.minDate, config?.maxDate);
      if (!isValidRange) {
        return false;
      }
    }
    if (newDateRange.end) {
      const isValidRange = isSameOrBetween(newDateRange.end, config?.minDate, config?.maxDate);
      if (!isValidRange) {
        return false;
      }
    }

    this.dateRange.set(newDateRange);
    return true;
  }

  protected timeSelected(newTime: Date): void {
    if (!newTime) {
      return;
    }

    // Break event cycle
    if (this.time?.getTime() === newTime.getTime()) {
      this.validateTime(newTime);
      return;
    }

    this.previousTime = this.time;
    this.time = newTime;

    const oldDate = this.getRelevantDate() ?? new Date();
    let newDate: Date;
    if (this.disabledTime()) {
      // if time is disabled, ensure that 00:00:00 is displayed in any timezone
      newDate = createDate(oldDate);
      this.time = newDate;
    } else {
      newDate = createDate(
        oldDate,
        this.time.getHours(),
        this.time.getMinutes(),
        this.time.getSeconds(),
        this.time.getMilliseconds()
      );
    }
    if (!this.config().enableDateRange) {
      this.setDate(newDate);
    } else {
      const newDateRange =
        this.dateRangeRole() === 'START'
          ? { start: newDate, end: this.dateRange()?.end }
          : { start: this.dateRange()?.start, end: newDate };
      this.setDateRange(newDateRange);
    }
  }

  protected toggleDisabledTime(): void {
    this.disabledTime.update(previous => !previous);
    this.config.update(c => {
      c.disabledTime = this.disabledTime();
      return c;
    });
    this.onDisabledTimeChanged();
  }

  private onDisabledTimeChanged(): void {
    if (!this.config().enableDateRange) {
      if (this.disabledTime()) {
        const date = this.date() ?? new Date();
        const newTime = new Date(
          Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
        );
        this.timeSelected(newTime);
      } else if (this.previousTime) {
        this.timeSelected(this.previousTime);
      } else {
        this.timeSelected(new Date());
      }
    }
  }

  private validateTime(date: Date): void {
    // wait for a cycle to initialize timepicker
    setTimeout(() => {
      const config = this.config();
      const timePicker = this.timePicker()!;
      if (
        !this.disabledTime() &&
        ((config.minDate && date < config.minDate) || (config.maxDate && date > config.maxDate))
      ) {
        timePicker.invalidHours = timePicker.invalidMinutes = true;
        timePicker.invalidSeconds = timePicker.invalidMilliseconds = true;
      } else {
        timePicker.invalidHours = timePicker.invalidMinutes = false;
        timePicker.invalidSeconds = timePicker.invalidMilliseconds = false;
      }
      this.cdRef.markForCheck();
    });
  }

  /**
   * Handle selection in the day view.
   * @param selection - selected date.
   */
  protected selectionChange(selection: Date): void {
    const newDate = createDate(
      selection,
      this.time?.getHours(),
      this.time?.getMinutes(),
      this.time?.getSeconds(),
      this.time?.getMilliseconds()
    );
    if (this.config().enableDateRange) {
      const rangeType = this.rangeType();
      let newDateRange: DateRange =
        !rangeType || rangeType === 'START'
          ? { start: newDate, end: undefined }
          : { start: this.dateRange()?.start, end: newDate };
      let newRangeType: RangeType = !rangeType || rangeType === 'START' ? 'START' : 'END';

      // The user selected a date before the current range start. Now the clicked day
      // is used as new start and the end is cleared
      if (newDateRange.start && newDateRange.end && newDateRange.end < newDateRange.start) {
        newDateRange = { start: newDateRange.end, end: undefined };
        newRangeType = 'START'; // Switch back to start so that the next selection is end
      }

      // Reset end range when we started start
      if (newRangeType === 'START' && newDateRange.end) {
        newDateRange.end = undefined;
      }

      const rangeValid = this.setDateRange(newDateRange);

      if (rangeValid) {
        // Toggle rangeType every time the user uses the datepicker to change the range
        this.rangeType.set(newRangeType === 'START' ? 'END' : 'START');
      }
    } else {
      this.focusedDate.set(newDate);
      this.setDate(newDate);
    }
  }

  /**
   * Handle month/year changes
   * @param selection - the selected month or null of cancelled.
   */
  protected activeMonthChange(selection: Date | null): void {
    if (selection) {
      this.focusedDate.set(changeDay(selection, this.actualFocusedDate().getDate()));
      const config = this.config();
      if (config.onlyMonthSelection) {
        if (config.enableDateRange) {
          this.selectionChange(selection);
        } else {
          this.setDate(selection);
        }
      }
    }
    this.view.set(this.monthViewSwitchTo);
  }

  /**
   * Handle year changes
   * @param selection - the selected year or null of cancelled.
   */
  protected activeYearChange(selection: Date | null): void {
    if (selection) {
      selection.setMonth(this.actualFocusedDate().getMonth());
      this.focusedDate.set(changeDay(selection, this.actualFocusedDate().getDate()));
    }
    this.view.set(this.yearViewSwitchTo);
  }

  /**
   * Focus the active cell in view.
   * The function is required to transfer the focus from input to the active date cell.
   */
  focusActiveCell(): void {
    this.activeView()?.focusActiveCell();
  }

  protected onActiveHoverChange(event?: Cell): void {
    this.activeHover.set(event);
  }
}
