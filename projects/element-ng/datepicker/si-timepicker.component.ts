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

interface Value {
  value: string;
  invalid: boolean;
}

interface TimeValue {
  hours: Value;
  minutes: Value;
  seconds: Value;
  milliseconds: Value;
}

interface Config {
  ariaLabel: string;
  label: string;
  maxLength: number;
  max: number;
  name: keyof TimeValue;
  pattern: string;
  placeholder: string;
  separator?: string;
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
  /** @internal */
  readonly forceInvalid = signal(false);

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
  protected readonly periods = computed(() => {
    const meridians = this.meridians();
    return meridians?.length ? meridians : this.periodDefaults;
  });
  protected readonly use12HourClock = computed(
    () => this.showMeridian() ?? getLocaleTimeFormat(this.locale, FormatWidth.Full).includes('a')
  );
  protected readonly disabled = computed(() => this.disabledInput() || this.disabledNgControl());
  protected readonly meridian = signal<'' | 'am' | 'pm'>('');
  protected readonly units = computed<Config[]>(() => {
    const config: Config[] = [
      {
        ariaLabel: this.hoursAriaLabel(),
        label: this.hoursLabel(),
        max: this.isPM() ? 12 : 24,
        maxLength: 2,
        name: 'hours',
        pattern: '2[0-4]|[01]?[0-9]',
        placeholder: this.hoursPlaceholder()
      }
    ];
    if (this.showMinutes()) {
      config.push({
        ariaLabel: this.minutesAriaLabel(),
        label: this.minutesLabel(),
        max: 60,
        maxLength: 2,
        name: 'minutes',
        pattern: '[0-5]?[0-9]',
        placeholder: this.minutesPlaceholder()
      });
    }
    if (this.showSeconds()) {
      config.push({
        ariaLabel: this.secondsAriaLabel(),
        label: this.secondsLabel(),
        max: 60,
        maxLength: 2,
        name: 'seconds',
        pattern: '[0-5]?[0-9]',
        placeholder: this.secondsPlaceholder()
      });
    }
    if (this.showMilliseconds()) {
      config.push({
        ariaLabel: this.millisecondsAriaLabel(),
        label: this.millisecondsLabel(),
        max: 1000,
        maxLength: 3,
        name: 'milliseconds',
        pattern: '[0-9]{1,3}',
        placeholder: this.millisecondsPlaceholder(),
        separator: '.'
      });
    }
    return config;
  });
  /* Input fields state */
  protected readonly unitValues = signal<TimeValue>({
    hours: { value: '', invalid: false },
    minutes: { value: '', invalid: false },
    seconds: { value: '', invalid: false },
    milliseconds: { value: '', invalid: false }
  });
  private readonly disabledNgControl = signal(false);
  private readonly locale = inject(LOCALE_ID).toString();

  /**
   * Holds the time as date object that is presented by this control.
   */
  private time?: Date;
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
      this.isInputValid();
    }
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

  protected updateField(name: keyof TimeValue, value: string): void {
    const unit = this.unitValues()[name];
    const config = this.units().find(u => u.name === name)!;
    if (unit && unit.value !== value) {
      unit.value = value.padStart(config.maxLength, '0');
      unit.invalid = isNaN(this.toNumber(value, config?.max)) && !this.isValidLimit();
      this.unitValues.update(v => ({ ...v, [name]: unit }));
      if (unit.invalid) {
        this.isValid.emit(false);
        this.onChange(null);
      } else {
        this.updateTime();
      }
    }
  }

  protected toggleMeridian(): void {
    const time = this.changeTime(this.time, { hour: 12 });
    this.setTime(time);
  }

  /**
   * Takes the current UI values and updates the time object value
   * accordingly, if they UI input values are valid.
   */
  private updateTime(): void {
    if (!this.isInputValid()) {
      this.isValid.emit(false);
      this.onChange(null);
      return;
    }

    this.setTime(this.createDateUpdate(this.time));
  }

  /**
   * Sets a new time object as model value, updates the user interface
   * and invokes onChange to let timepicker clients know about the update.
   * @param time - The new time to be set.
   */
  private setTime(time?: Date | undefined): void {
    if (this.time !== time) {
      this.time = time;
      this.updateUI(this.time);
      this.onChange(this.time);
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
      const invalid = true;
      this.unitValues.set({
        hours: { value: '', invalid },
        minutes: { value: '', invalid },
        seconds: { value: '', invalid },
        milliseconds: { value: '', invalid }
      });
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
      const invalid = false;
      this.unitValues.set({
        hours: { value: hours.toString().padStart(2, '0'), invalid },
        minutes: { value: time.getMinutes().toString().padStart(2, '0'), invalid },
        seconds: { value: time.getUTCSeconds().toString().padStart(2, '0'), invalid },
        milliseconds: { value: time.getUTCMilliseconds().toString().padStart(3, '0'), invalid }
      });
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

  private createDateUpdate(date: Date | undefined): Date | undefined {
    const value = this.unitValues();
    let hour = this.toNumber(value.hours.value, this.isPM() ? 12 : 24);
    const minute = this.toNumber(value.minutes.value, 60);
    const seconds = this.toNumber(value.seconds.value, 60) || 0;
    const milliseconds = this.toNumber(value.milliseconds.value, 1000) || 0;

    if (this.isPM() && hour !== 12) {
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

  private toNumber(value?: string | number, limit?: number): number {
    if (typeof value === 'undefined') {
      return NaN;
    } else if (typeof value === 'string') {
      value = parseInt(value, 10);
    }

    if (limit !== undefined && (isNaN(value) || value < 0 || value > limit)) {
      return NaN;
    }
    return value;
  }

  private isInputValid(): boolean {
    const v = { ...this.unitValues() };
    const units = this.units();
    const invalid = !this.isValidLimit();
    if (invalid) {
      v.hours.invalid = v.minutes.invalid = v.seconds.invalid = v.milliseconds.invalid = true;
    } else {
      for (const config of units) {
        v[config.name].invalid = isNaN(this.toNumber(v[config.name].value, config.max));
      }
    }
    this.unitValues.set(v);

    return !v.hours.invalid && !v.minutes.invalid && !v.seconds.invalid && !v.milliseconds.invalid;
  }

  private isValidLimit(): boolean {
    const refDate = new Date();
    const newDate = this.createDateUpdate(refDate);

    if (!newDate) {
      return false;
    }

    let refMax: Date | undefined;
    const max = this.max();
    if (max) {
      refMax = new Date(refDate);
      refMax.setHours(max.getHours());
      refMax.setMinutes(max.getMinutes());
      refMax.setSeconds(max.getSeconds());
      refMax.setMilliseconds(max.getMilliseconds());
    }

    let refMin: Date | undefined;
    const min = this.min();
    if (min) {
      refMin = new Date(refDate);
      refMin.setHours(min.getHours());
      refMin.setMinutes(min.getMinutes());
      refMin.setSeconds(min.getSeconds());
      refMin.setMilliseconds(min.getMilliseconds());
    }

    if (refMax && newDate > refMax) {
      return false;
    } else if (refMin && newDate < refMin) {
      return false;
    }
    return true;
  }

  private changeTimeComponent(key: string, up: boolean): void {
    const change = up ? 1 : -1;
    const date = this.createDateUpdate(new Date());
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
        this.updateField('hours', hour.toString());
        break;
      }
      case 'minutes': {
        const newTime = this.changeTime(date, { minute: change });
        this.updateField('minutes', newTime.getMinutes().toString());
        break;
      }
      case 'seconds': {
        const newTime = this.changeTime(date, { seconds: change });
        this.updateField('seconds', newTime.getSeconds().toString());
        break;
      }
      case 'milliseconds': {
        const newTime = this.changeTime(date, { milliseconds: change });
        this.updateField('milliseconds', newTime.getMilliseconds().toString());
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
      this.onTouched();
    }
  }
}
