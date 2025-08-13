/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { A11yModule, FocusOrigin } from '@angular/cdk/a11y';
import {
  FormatWidth,
  FormStyle,
  getLocaleDayPeriods,
  getLocaleTimeFormat,
  NgTemplateOutlet,
  TranslationWidth
} from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  HostAttributeToken,
  inject,
  input,
  LOCALE_ID,
  output,
  signal,
  viewChildren
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SI_FORM_ITEM_CONTROL, SiFormItemControl } from '@siemens/element-ng/form';
import { SiTranslatePipe, t, TranslatableString } from '@siemens/element-translate-ng/translate';

import { createDate } from './date-time-helper';

/**
 * @internal
 */
interface TimeComponents {
  hour?: string | number;
  minute?: string | number;
  seconds?: string | number;
  milliseconds?: string | number;
  isPM?: boolean;
}

@Component({
  selector: 'si-timepicker',
  imports: [NgTemplateOutlet, FormsModule, SiTranslatePipe, A11yModule],
  templateUrl: './si-timepicker.component.html',
  styleUrl: './si-timepicker.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SiTimepickerComponent,
      multi: true
    },
    {
      provide: SI_FORM_ITEM_CONTROL,
      useExisting: SiTimepickerComponent
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'group',
    class: 'form-custom-control',
    '[class.readonly]': 'readonly()',
    '[attr.aria-labelledby]': 'labelledby'
  }
})
export class SiTimepickerComponent implements ControlValueAccessor, SiFormItemControl {
  private static idCounter = 0;

  private readonly touched = signal(false);
  private readonly hoursTouched = signal(false);
  private readonly minutesTouched = signal(false);
  private readonly secondsTouched = signal(false);
  private readonly millisecondsTouched = signal(false);

  /** @internal */
  readonly invalidHours = computed(() => {
    const hours = this.hours();
    if (!hours) {
      return this.touched() || this.hoursTouched();
    }

    // Basic input validation always applies
    if (!this.isHourInputValid(hours, this.isPM())) {
      return true;
    }

    // Time limit validation when min/max constraints exist
    return !this.isWithinTimeLimit();
  });

  /** @internal */
  readonly invalidMinutes = computed(() => {
    const minutes = this.minutes();
    if (!minutes) {
      return this.touched() || this.minutesTouched();
    }

    // Basic input validation always applies
    if (!this.isMinuteInputValid(minutes)) {
      return true;
    }

    // Time limit validation when min/max constraints exist
    return !this.isWithinTimeLimit();
  });

  /** @internal */
  readonly invalidSeconds = computed(() => {
    const seconds = this.seconds();
    if (!seconds) {
      return this.touched() || this.secondsTouched();
    }

    // Basic input validation always applies
    if (!this.isSecondInputValid(seconds)) {
      return true;
    }

    // Time limit validation when min/max constraints exist
    return !this.isWithinTimeLimit();
  });

  /** @internal */
  readonly invalidMilliseconds = computed(() => {
    const milliseconds = this.milliseconds();
    if (!milliseconds) {
      return this.touched() || this.millisecondsTouched();
    }

    // Basic input validation always applies
    if (!this.isMillisecondInputValid(milliseconds)) {
      return true;
    }

    // Time limit validation when min/max constraints exist
    return !this.isWithinTimeLimit();
  });

  /**
   * @defaultValue
   * ```
   * `__si-timepicker-${SiTimepickerComponent.idCounter++}`
   * ```
   */
  readonly id = input(`__si-timepicker-${SiTimepickerComponent.idCounter++}`);

  readonly labelledby =
    inject(new HostAttributeToken('aria-labelledby'), {
      optional: true
    }) ?? `${this.id()}-label`;
  /**
   * All input fields will be disabled if set to true.
   *
   * @defaultValue false
   */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly disabledInput = input(false, { alias: 'disabled' });

  /**
   * @defaultValue 'hh'
   */
  readonly hoursLabel = input<TranslatableString>('hh');
  /**
   * @defaultValue 'mm'
   */
  readonly minutesLabel = input<TranslatableString>('mm');
  /**
   * @defaultValue 'ss'
   */
  readonly secondsLabel = input<TranslatableString>('ss');
  /**
   * @defaultValue 'ms'
   */
  readonly millisecondsLabel = input<TranslatableString>('ms');
  /**
   * Hide the labels of the input fields.
   * @defaultValue false
   */
  readonly hideLabels = input(false, { transform: booleanAttribute });

  /**
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_DATEPICKER.HOURS:Hours`)
   * ```
   */
  readonly hoursAriaLabel = input(t(() => $localize`:@@SI_DATEPICKER.HOURS:Hours`));
  /**
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_DATEPICKER.MINUTES:Minutes`)
   * ```
   */
  readonly minutesAriaLabel = input(t(() => $localize`:@@SI_DATEPICKER.MINUTES:Minutes`));
  /**
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_DATEPICKER.SECONDS:Seconds`)
   * ```
   */
  readonly secondsAriaLabel = input(t(() => $localize`:@@SI_DATEPICKER.SECONDS:Seconds`));
  /**
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_DATEPICKER.MILLISECONDS:Milliseconds`)
   * ```
   */
  readonly millisecondsAriaLabel = input(
    t(() => $localize`:@@SI_DATEPICKER.MILLISECONDS:Milliseconds`)
  );

  /**
   * @defaultValue 'hh'
   */
  readonly hoursPlaceholder = input('hh');
  /**
   * @defaultValue 'mm'
   */
  readonly minutesPlaceholder = input('mm');
  /**
   * @defaultValue 'ss'
   */
  readonly secondsPlaceholder = input('ss');
  /**
   * @defaultValue 'ms'
   */
  readonly millisecondsPlaceholder = input('ms');

  readonly meridians = input<string[]>();
  /**
   * @defaultValue 'am/pm'
   */
  readonly meridiansLabel = input<TranslatableString>('am/pm');
  /**
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_DATEPICKER.PERIOD:Period`)
   * ```
   */
  readonly meridiansAriaLabel = input(t(() => $localize`:@@SI_DATEPICKER.PERIOD:Period`));

  /** @defaultValue true */
  readonly showMinutes = input(true, { transform: booleanAttribute });
  /** @defaultValue false */
  readonly showSeconds = input(false, { transform: booleanAttribute });
  /** @defaultValue false */
  readonly showMilliseconds = input(false, { transform: booleanAttribute });
  /**
   * Show time in 12-hour period including the select to toggle between AM/PM.
   */
  readonly showMeridian = input<boolean | undefined>();

  /**
   * A minimum time limit. The date part of the date object will be ignored.
   */
  readonly min = input<Date>();

  /**
   * A maximum time limit. The date part of the date object will be ignored.
   */
  readonly max = input<Date>();

  /** @defaultValue false */
  readonly readonly = input(false, { transform: booleanAttribute });

  readonly isValid = output<boolean>();
  readonly meridianChange = output<string>();
  readonly inputCompleted = output<void>();

  private readonly inputParts = viewChildren<ElementRef<HTMLElement>>('inputPart');

  /** @internal */
  readonly errormessageId = `${this.id()}-errormessage`;

  private onChange: (val: any) => void = () => {};
  private onTouched: () => void = () => {};

  // The following are the time values for the ui.
  protected readonly hours = signal('');
  protected readonly minutes = signal('');
  protected readonly seconds = signal('');
  protected readonly milliseconds = signal('');
  protected readonly periods = computed(() => {
    const meridians = this.meridians();
    return meridians?.length ? meridians : this.periodDefaults;
  });
  protected readonly use12HourClock = computed(
    () => this.showMeridian() ?? getLocaleTimeFormat(this.locale, FormatWidth.Full).includes('a')
  );
  protected readonly disabled = computed(() => this.disabledInput() || this.disabledNgControl());
  protected readonly meridian = signal<'' | 'am' | 'pm'>('');
  private readonly disabledNgControl = signal(false);
  private readonly locale = inject(LOCALE_ID).toString();
  private readonly cdRef = inject(ChangeDetectorRef);

  /**
   * Holds the time as date object that is presented by this control.
   */
  private readonly time = signal<Date | undefined>(undefined);

  /**
   * Computed property that indicates if the entire time input is valid
   */
  private readonly isCompletelyValid = computed(() => {
    return (
      !this.invalidHours() &&
      !this.invalidMinutes() &&
      !this.invalidSeconds() &&
      !this.invalidMilliseconds()
    );
  });

  private periodDefaults: string[];

  constructor() {
    this.periodDefaults = getLocaleDayPeriods(
      this.locale,
      FormStyle.Format,
      TranslationWidth.Short
    ).slice();
  }

  writeValue(obj?: Date | string): void {
    if (this.isValidDate(obj)) {
      this.setTime(this.parseTime(obj));
    } else if (obj == null) {
      this.setTime();
    }
    if (obj) {
      this.isInputValid(
        this.hours(),
        this.minutes(),
        this.seconds(),
        this.milliseconds(),
        this.isPM()
      );
    }
    this.cdRef.markForCheck();
  }

  /** @internal */
  isPM(): boolean {
    return this.use12HourClock() && this.meridian() === 'pm';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledNgControl.set(isDisabled);
  }

  /**
   * Handle Enter, Arrow up/down and Space key press events.
   */
  protected handleKeyPressEvent(event: KeyboardEvent): void {
    const target = event.target as HTMLInputElement;
    switch (event.key) {
      case 'Enter':
        this.focusNext(event);
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        if (!this.readonly()) {
          this.changeTimeComponent(target.name, event.key === 'ArrowUp');
        } else {
          event.preventDefault();
        }
        break;
      case ' ':
        if (this.readonly()) {
          event.preventDefault();
        }
        break;
      default:
        break;
    }
  }

  protected toHtmlInputElement = (target?: EventTarget | null): HTMLInputElement =>
    target as HTMLInputElement;

  protected updateHours(value: string): void {
    if (!this.readonly()) {
      this.hours.set(value);
      this.hoursTouched.set(true);

      const isValid = !this.invalidHours();
      if (!isValid) {
        this.isValid.emit(false);
        this.onChange(null);
      } else {
        this.updateTime();
      }
    }
  }

  protected updateMinutes(value: string): void {
    if (!this.readonly()) {
      this.minutes.set(value);
      this.minutesTouched.set(true);

      const isValid = !this.invalidMinutes();
      if (!isValid) {
        this.isValid.emit(false);
        this.onChange(null);
      } else {
        this.updateTime();
      }
    }
  }

  protected updateSeconds(value: string): void {
    if (!this.readonly()) {
      this.seconds.set(value);
      this.secondsTouched.set(true);

      const isValid = !this.invalidSeconds();
      if (!isValid) {
        this.isValid.emit(false);
        this.onChange(null);
      } else {
        this.updateTime();
      }
    }
  }

  protected updateMilliseconds(value: string): void {
    if (!this.readonly()) {
      this.milliseconds.set(value);
      this.millisecondsTouched.set(true);

      const isValid = !this.invalidMilliseconds();
      if (!isValid) {
        this.isValid.emit(false);
        this.onChange(null);
      } else {
        this.updateTime();
      }
    }
  }

  protected toggleMeridian(): void {
    const time = this.changeTime(this.time(), { hour: 12 });
    this.setTime(time);
    this.updateTime();
  }

  /**
   * Takes the current UI values and updates the time object value
   * accordingly, if they UI input values are valid.
   */
  private updateTime(): void {
    const minutes = this.showMinutes() ? this.minutes() : '0';
    const seconds = this.showSeconds() ? this.seconds() : '0';
    const milliseconds = this.showMilliseconds() ? this.milliseconds() : '0';

    if (!this.isInputValid(this.hours(), minutes, seconds, milliseconds, this.isPM())) {
      this.isValid.emit(false);
      this.onChange(null);
      return;
    }

    const time = this.createDateUpdate(this.time(), {
      hour: this.hours(),
      minute: this.minutes(),
      seconds: this.seconds(),
      milliseconds: this.milliseconds(),
      isPM: this.isPM()
    });
    this.setTime(time);
  }

  /**
   * Sets a new time object as model value, updates the user interface
   * and invokes onChange to let timepicker clients know about the update.
   * @param time - The new time to be set.
   */
  private setTime(time?: Date | undefined): void {
    if (this.time() !== time) {
      this.time.set(time);
      this.updateUI(this.time());
      this.onChange(this.time());
    }
  }

  /**
   * Updates the user interface by filling the time components
   * into the time input fields. Sets empty values if the date
   * is undefined or invalid.
   *
   * @param value - The date object or string from with the time components are taken.
   */
  private updateUI(value?: string | Date): void {
    if (!value || !this.isValidDate(value)) {
      this.hours.set('');
      this.minutes.set('');
      this.seconds.set('');
      this.milliseconds.set('');
      this.meridian.set('am');
      this.meridianChange.emit(this.meridian());
    } else {
      const time = this.parseTime(value);
      if (!time) {
        return;
      }

      let hours = time.getHours();
      if (this.use12HourClock()) {
        this.meridian.set(hours >= 12 ? 'pm' : 'am');
        this.meridianChange.emit(this.meridian());
        hours = hours % 12;
        if (hours === 0) {
          hours = 12;
        }
      }

      this.hours.set(hours.toString().padStart(2, '0'));
      this.minutes.set(time.getMinutes().toString().padStart(2, '0'));
      this.seconds.set(time.getUTCSeconds().toString().padStart(2, '0'));
      this.milliseconds.set(time.getUTCMilliseconds().toString().padStart(3, '0'));
    }
  }

  private isValidDate(value?: string | Date): boolean {
    if (!value) {
      return false;
    }

    if (typeof value === 'string') {
      return this.isValidDate(new Date(value));
    }

    if (value instanceof Date && isNaN(value.getHours())) {
      return false;
    }

    return true;
  }

  private parseTime(value?: string | Date): Date | undefined {
    if (typeof value === 'string') {
      return new Date(value);
    }
    return value;
  }

  private parseHours(value?: string | number, isPM = false): number {
    const hour = this.toNumber(value);
    if (isNaN(hour) || hour < 0 || hour > (isPM ? 12 : 24)) {
      return NaN;
    }
    return hour;
  }

  private parseMinutes(value?: string | number): number {
    const minute = this.toNumber(value);
    if (isNaN(minute) || minute < 0 || minute > 60) {
      return NaN;
    }
    return minute;
  }

  private parseSeconds(value?: string | number): number {
    const seconds = this.toNumber(value);
    if (isNaN(seconds) || seconds < 0 || seconds > 60) {
      return NaN;
    }
    return seconds;
  }

  private parseMilliseconds(value?: string | number): number {
    const milliseconds = this.toNumber(value);
    if (isNaN(milliseconds) || milliseconds < 0 || milliseconds > 1000) {
      return NaN;
    }
    return milliseconds;
  }

  private createDateUpdate(date: Date | undefined, time: TimeComponents): Date | undefined {
    let hour = this.parseHours(time.hour);
    const minute = this.parseMinutes(time.minute);
    const seconds = this.parseSeconds(time.seconds) || 0;
    const milliseconds = this.parseMilliseconds(time.milliseconds) || 0;

    if (time.isPM && hour !== 12) {
      hour += 12;
    }

    if (!date) {
      if (!isNaN(hour) && !isNaN(minute)) {
        return createDate(new Date(), hour, minute, seconds, milliseconds);
      } else {
        return date;
      }
    } else if (isNaN(hour) || isNaN(minute)) {
      return date;
    } else {
      return createDate(date, hour, minute, seconds, milliseconds);
    }
  }

  private toNumber(value?: string | number): number {
    if (typeof value === 'undefined') {
      return NaN;
    } else if (typeof value === 'number') {
      return value;
    }
    return parseInt(value, 10);
  }

  private isInputValid(
    hours: string,
    minutes: string,
    seconds: string,
    milliseconds: string,
    isPM: boolean
  ): boolean {
    return this.isCompletelyValid();
  }

  private isHourInputValid(hours: string, isPM: boolean): boolean {
    return !isNaN(this.parseHours(hours, isPM));
  }

  private isMinuteInputValid(minutes: string): boolean {
    return !isNaN(this.parseMinutes(minutes));
  }

  private isSecondInputValid(seconds: string): boolean {
    return !isNaN(this.parseSeconds(seconds));
  }

  private isMillisecondInputValid(milliseconds: string): boolean {
    return !isNaN(this.parseMilliseconds(milliseconds));
  }

  private isWithinTimeLimit(): boolean {
    const min = this.min();
    const max = this.max();

    if (!min && !max) {
      return true;
    }

    const currentHours = this.hours();
    const currentMinutes = this.minutes();
    const currentSeconds = this.seconds();
    const currentMilliseconds = this.milliseconds();

    // If any component is empty, skip limit validation
    if (!currentHours || !currentMinutes || !currentSeconds || !currentMilliseconds) {
      return true;
    }

    const baseDate = new Date();
    const currentTime = this.createDateUpdate(baseDate, {
      hour: currentHours,
      minute: currentMinutes,
      seconds: currentSeconds,
      milliseconds: currentMilliseconds,
      isPM: this.isPM()
    });

    if (!currentTime) {
      return false;
    }

    if (min) {
      const minTime = new Date(baseDate);
      minTime.setHours(min.getHours(), min.getMinutes(), min.getSeconds(), min.getMilliseconds());
      if (currentTime < minTime) {
        return false;
      }
    }

    if (max) {
      const maxTime = new Date(baseDate);
      maxTime.setHours(max.getHours(), max.getMinutes(), max.getSeconds(), max.getMilliseconds());
      if (currentTime > maxTime) {
        return false;
      }
    }

    return true;
  }

  private changeTimeComponent(key: string, up: boolean): void {
    const change = up ? 1 : -1;
    const date = this.createDateUpdate(new Date(), {
      hour: this.hours(),
      minute: this.minutes(),
      seconds: this.seconds(),
      milliseconds: this.milliseconds(),
      isPM: this.isPM()
    });
    switch (key) {
      case 'hours': {
        const newTime = this.changeTime(date, { hour: change });
        let hour = newTime!.getHours();
        if (this.use12HourClock()) {
          hour = hour % 12;
          if (hour === 0 && !this.isPM()) {
            hour = 12;
          } else if (hour === 0 && this.isPM()) {
            this.toggleMeridian();
          }
        }
        this.updateHours(hour.toString());
        break;
      }
      case 'minutes': {
        const newTime = this.changeTime(date, { minute: change });
        this.updateMinutes(newTime.getMinutes().toString());
        break;
      }
      case 'seconds': {
        const newTime = this.changeTime(date, { seconds: change });
        this.updateSeconds(newTime.getSeconds().toString());
        break;
      }
      case 'milliseconds': {
        const newTime = this.changeTime(date, { milliseconds: change });
        this.updateMilliseconds(newTime.getMilliseconds().toString());
        break;
      }
      default:
        break;
    }
  }

  private changeTime(value?: Date, diff?: TimeComponents): Date {
    if (!value) {
      return this.changeTime(createDate(new Date(), 0, 0, 0, 0), diff);
    }

    if (!diff) {
      return value;
    }

    let hour = value.getHours();
    let minutes = value.getMinutes();
    let seconds = value.getSeconds();
    let milliseconds = value.getMilliseconds();

    if (diff.hour) {
      hour = hour + this.toNumber(diff.hour);
    }

    if (diff.minute) {
      minutes = minutes + this.toNumber(diff.minute);
    }

    if (diff.seconds) {
      seconds = seconds + this.toNumber(diff.seconds);
    }
    if (diff.milliseconds) {
      milliseconds = milliseconds + this.toNumber(diff.milliseconds);
    }

    return createDate(value, hour, minutes, seconds, milliseconds);
  }

  /**
   * Focuses the next available input/select field or emit inputCompleted event.
   */
  protected focusNext(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target) {
      return;
    }
    const targets = this.inputParts();
    const position = targets?.findIndex(ref => ref.nativeElement === target);
    if (position === undefined || position === -1) {
      return;
    }

    if (position < targets!.length - 1) {
      targets![position + 1].nativeElement.focus();
    } else {
      this.inputCompleted.emit();
    }
  }

  protected focusChange(event: FocusOrigin): void {
    if (event === null) {
      this.touched.set(true);
      this.onTouched();
    }
  }
}
