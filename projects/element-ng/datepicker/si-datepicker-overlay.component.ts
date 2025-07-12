/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import {
  A11yModule,
  ConfigurableFocusTrap,
  ConfigurableFocusTrapFactory,
  FocusMonitor
} from '@angular/cdk/a11y';
import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  model,
  OnChanges,
  OnDestroy,
  OnInit,
  output,
  signal,
  SimpleChanges,
  viewChild
} from '@angular/core';

import { Cell } from './components/si-calendar-body.component';
import { isValid, nextMonth, previousMonth } from './date-time-helper';
import { SiDatepickerComponent } from './si-datepicker.component';
import { DatepickerConfig, DateRange } from './si-datepicker.model';

@Component({
  selector: 'si-datepicker-overlay',
  imports: [SiDatepickerComponent, A11yModule],
  template: `
    <si-datepicker
      #datepicker
      tabindex="-1"
      [initialFocus]="initialFocus()"
      [config]="firstDatepickerConfig()"
      [class.first-datepicker]="isTwoMonthDateRange() && !isMobile()"
      [class.first-datepicker-mobile]="isTwoMonthDateRange() && isMobile()"
      [date]="date()"
      [dateRange]="dateRange()"
      [dateRangeRole]="isTwoMonthDateRange() ? 'START' : undefined"
      [time12h]="time12h()"
      [timepickerLabel]="firstDatepickerConfig().startTimeLabel"
      [maxMonth]="maxMonth()"
      [rangeType]="rangeType()"
      [(activeHover)]="activeHover"
      (dateChange)="date.set($event)"
      (dateRangeChange)="dateRange.set($event)"
      (disabledTimeChange)="disableTime = $event; disabledTimeChange.emit($event)"
      (focusedDateChange)="firstDatepickerFocusDateChange($event)"
      (rangeTypeChange)="rangeType.set($event)"
    />
    @if (isTwoMonthDateRange()) {
      <si-datepicker
        #datepickerTwo
        class="mh-100 overflow-auto"
        tabindex="-1"
        dateRangeRole="END"
        [class.second-datepicker]="!isMobile()"
        [class.second-datepicker-mobile]="isMobile()"
        [hideTimeToggle]="true"
        [initialFocus]="initialFocus()"
        [config]="secondDatepickerConfig()"
        [date]="date()"
        [hideCalendar]="isMobile()"
        [minMonth]="minMonth()"
        [dateRange]="dateRange()"
        [disabledTime]="disableTime"
        [time12h]="time12h()"
        [timepickerLabel]="secondDatepickerConfig().endTimeLabel"
        [rangeType]="rangeType()"
        [(activeHover)]="activeHover"
        (dateRangeChange)="dateRange.set($event)"
        (focusedDateChange)="secondDatepickerFocusDateChange($event)"
        (rangeTypeChange)="rangeType.set($event)"
      />
    }
  `,
  styleUrl: './si-datepicker-overlay.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
  host: {
    class: 'mt-md-1 d-flex elevation-2 rounded-2 overflow-auto align-items-stretch',
    '[class.flex-wrap]': 'isMobile()',
    '[class.mobile-datepicker-overlay]': 'isMobile()',
    '[class.fade]': 'isMobile()',
    '[class.show]': 'completeAnimation()'
  }
})
export class SiDatepickerOverlayComponent implements OnChanges, OnInit, AfterViewInit, OnDestroy {
  protected readonly minMonth = signal<Date | undefined>(undefined);
  protected readonly maxMonth = signal<Date | undefined>(undefined);

  protected readonly datepicker = viewChild.required(SiDatepickerComponent);
  /**
   * {@inheritDoc SiDatepickerComponent#initialFocus}
   * @defaultValue false
   */
  readonly initialFocus = input(false, { transform: booleanAttribute });
  /**
   * {@inheritDoc SiDatepickerComponent#config}
   * @defaultValue
   * ```
   * {}
   * ```
   */
  readonly config = input<DatepickerConfig>({});
  /**
   * {@inheritDoc SiDatepickerComponent#date}
   */
  readonly date = model<Date>();
  /**
   * {@inheritDoc SiDatepickerComponent#dateRange}
   */
  readonly dateRange = model<DateRange>();
  /**
   * {@inheritDoc SiDatepickerComponent#rangeType}
   */
  readonly rangeType = model<'START' | 'END'>();
  /**
   * {@inheritDoc SiDatepickerComponent#time12h}
   * @defaultValue false
   */
  readonly time12h = input(false, { transform: booleanAttribute });
  /**
   * Emits an event to notify about disabling the time from the datepicker.
   * When time is disable, we construct a pure date object in UTC 00:00:00 time.
   */
  readonly disabledTimeChange = output<boolean>();
  /**
   * @deprecated Property provides internal information that should not be used.
   *
   * @defaultValue false
   */
  isFocused = false;
  private readonly document = inject(DOCUMENT);
  private readonly elementRef = inject(ElementRef);
  private readonly focusMonitor = inject(FocusMonitor);
  private readonly focusTrapFactory = inject(ConfigurableFocusTrapFactory);
  private focusTrap!: ConfigurableFocusTrap;
  private previousActiveElement?: Element | HTMLElement;
  protected disableTime = false;
  protected activeHover?: Cell;
  protected readonly isTwoMonthDateRange = computed(
    () =>
      !!this.config().enableDateRange &&
      (!!this.config().enableTwoMonthDateRange || !!this.config().showTime)
  );
  protected readonly firstDatepickerConfig = signal<DatepickerConfig>({});
  protected readonly secondDatepickerConfig = signal<DatepickerConfig>({});
  /**
   * Indicate that the overlay is opened in small screen.
   * A modal dialog animation display when true and a wrapped two month calendar layout is displayed.
   *
   * @defaultValue false
   */
  readonly isMobile = input(false);

  protected readonly completeAnimation = signal(false);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.config) {
      const config = this.config();

      this.firstDatepickerConfig.set(
        !this.isTwoMonthDateRange ? config : { ...config, hideLabels: true }
      );

      this.secondDatepickerConfig.set({ ...config, hideLabels: true });
    }

    const dateRange = this.dateRange();
    if (
      changes.config?.currentValue?.onlyMonthSelection &&
      this.isTwoMonthDateRange() &&
      dateRange?.start
    ) {
      this.minMonth.set(new Date(dateRange?.start.getFullYear(), 0, 1));
    }

    this.rangeType.set('START');
    if (
      isValid(changes.dateRange?.currentValue?.start) &&
      !isValid(changes.dateRange?.currentValue?.end)
    ) {
      this.rangeType.set('END');
    }
  }

  ngOnInit(): void {
    this.focusTrap = this.focusTrapFactory.create(this.elementRef.nativeElement);
    this.previousActiveElement = this.document.activeElement ?? undefined;
    if (this.isMobile()) {
      setTimeout(() => this.completeAnimation.set(true), 150);
    }
  }

  ngAfterViewInit(): void {
    // Monitor focus events
    this.focusMonitor
      .monitor(this.elementRef, true)
      .subscribe(origin => (this.isFocused = origin !== undefined));
  }

  ngOnDestroy(): void {
    this.focusMonitor.stopMonitoring(this.elementRef);
    this.focusTrap.destroy();
    if (this.initialFocus() && this.previousActiveElement && 'focus' in this.previousActiveElement)
      this.previousActiveElement.focus();
  }

  /**
   * Focus active cell in the current datepicker view.
   */
  focusActiveCell(): void {
    this.datepicker().focusActiveCell();
  }

  protected firstDatepickerFocusDateChange(newFocusedDate?: Date): void {
    if (!newFocusedDate) {
      return;
    }
    if (this.config()?.onlyMonthSelection) {
      this.minMonth.set(new Date(newFocusedDate.getFullYear() + 1, 0, 1));
    } else if (newFocusedDate !== this.maxMonth()) {
      this.minMonth.set(nextMonth(newFocusedDate));
    }
  }

  protected secondDatepickerFocusDateChange(newFocusedDate?: Date): void {
    if (newFocusedDate && newFocusedDate !== this.minMonth()) {
      if (this.config()?.onlyMonthSelection) {
        this.maxMonth.set(new Date(newFocusedDate.getFullYear() - 1, 11, 31));
      } else {
        this.maxMonth.set(previousMonth(newFocusedDate));
      }
    }
  }
}
