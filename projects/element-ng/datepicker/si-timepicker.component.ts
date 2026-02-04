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
  effect,
  ElementRef,
  HostAttributeToken,
  inject,
  input,
  LOCALE_ID,
  output,
  signal,
  viewChildren
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormBuilder,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
  Validator,
  ValidatorFn
} from '@angular/forms';
import { SI_FORM_ITEM_CONTROL, SiFormItemControl } from '@siemens/element-ng/form';
import { SiTranslatePipe, t, TranslatableString } from '@siemens/element-translate-ng/translate';

import { createDate } from './date-time-helper';

interface Value<T = string> {
  hours: T;
  minutes: T;
  seconds: T;
  milliseconds: T;
}

interface TimeComponents extends Partial<Value<string | number>> {
  isPM?: boolean;
}

interface Config {
  ariaLabel: TranslatableString;
  label: TranslatableString;
  maxLength: number;
  max: number;
  name: keyof Value;
  placeholder: string;
  separator?: string;
}

const dateWithTime = (base: Date, time: Date): Date =>
  createDate(base, time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds());

@Component({
  selector: 'si-timepicker',
  imports: [A11yModule, NgTemplateOutlet, ReactiveFormsModule, SiTranslatePipe],
  templateUrl: './si-timepicker.component.html',
  styleUrl: './si-timepicker.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SiTimepickerComponent,
      multi: true
    },
    {
      provide: NG_VALIDATORS,
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
export class SiTimepickerComponent implements ControlValueAccessor, Validator, SiFormItemControl {
  private static idCounter = 0;
  private readonly locale = inject(LOCALE_ID).toString();
  private readonly formBuilder = inject(FormBuilder);

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

  /**
   * This ID will be bound to the `aria-describedby` attribute of the timepicker.
   * Use this to reference the element containing the error message(s) for the timepicker.
   * It will be picked by the {@link SiFormItemComponent} if the timepicker is used inside a form item.
   *
   * @defaultValue
   * ```
   * `${this.id()}-errormessage`
   * ```
   */
  readonly errormessageId = input(`${this.id()}-errormessage`);

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
        max: this.isPM() ? 12 : 23,
        maxLength: 2,
        name: 'hours',
        placeholder: this.hoursPlaceholder()
      }
    ];
    if (this.showMinutes()) {
      config.push({
        ariaLabel: this.minutesAriaLabel(),
        label: this.minutesLabel(),
        max: 59,
        maxLength: 2,
        name: 'minutes',
        placeholder: this.minutesPlaceholder()
      });
    }
    if (this.showSeconds()) {
      config.push({
        ariaLabel: this.secondsAriaLabel(),
        label: this.secondsLabel(),
        max: 59,
        maxLength: 2,
        name: 'seconds',
        placeholder: this.secondsPlaceholder()
      });
    }
    if (this.showMilliseconds()) {
      config.push({
        ariaLabel: this.millisecondsAriaLabel(),
        label: this.millisecondsLabel(),
        max: 999,
        maxLength: 3,
        name: 'milliseconds',
        placeholder: this.millisecondsPlaceholder(),
        separator: '.'
      });
    }
    return config;
  });

  /* Input fields state */
  protected readonly timeControls = this.formBuilder.group({
    hours: this.formBuilder.nonNullable.control('', [this.validateTime('hours')]),
    minutes: this.formBuilder.nonNullable.control('', [this.validateTime('minutes')]),
    seconds: this.formBuilder.nonNullable.control('', [this.validateTime('seconds')]),
    milliseconds: this.formBuilder.nonNullable.control('', [this.validateTime('milliseconds')])
  });
  /** Indicate whether one of the input fields has an invalid value. */
  protected hasInvalidUnit(): boolean {
    const values = this.timeControls.value;
    for (const config of this.units()) {
      const unit = values[config.name]!;
      if (isNaN(this.toNumber(unit, config.max))) {
        return true;
      }
    }
    return false;
  }
  private readonly disabledNgControl = signal(false);

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
    effect(() => {
      if (this.disabled()) {
        this.timeControls.disable({ emitEvent: false, onlySelf: true });
      } else {
        this.timeControls.enable({ emitEvent: false, onlySelf: true });
      }
    });
    Object.values(this.timeControls.controls).forEach(control => {
      control.valueChanges.subscribe(value => {
        // Enforce digits only
        const cleaned = value.replace(/\D/g, '');
        if (cleaned !== value) {
          control?.setValue(cleaned, { emitEvent: false });
        }
      });
    });
  }

  writeValue(obj?: Date | string): void {
    const time = this.parseTime(obj);
    if (!time || this.isValidDate(time)) {
      this.time = time;
      this.updateUI(this.time);
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

  /** @internal */
  validate(control: AbstractControl): ValidationErrors | null {
    const childErrors = this.units()
      .map(u => this.timeControls.controls[u.name].errors)
      .reduce((prevObj, field) => ({ ...prevObj, ...field }), {} as ValidationErrors);
    if (childErrors && Object.keys(childErrors).length) {
      return childErrors;
    }
    const errors: ValidationErrors = {
      ...this.validateMin(control),
      ...this.validateMax(control)
    };
    return Object.keys(errors).length ? errors : null;
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

  protected updateField(name: keyof Value, value: string): void {
    this.timeControls.get(name)?.setValue(value, { emitEvent: false });
    this.updateTime();
    this.onTouched();
  }

  protected toggleMeridian(): void {
    const time = this.changeTime(this.time, { hours: 12 });
    this.setTime(time);
  }

  /**
   * Takes the current UI values and updates the time object value
   * accordingly, if they UI input values are valid.
   */
  private updateTime(): void {
    if (this.hasInvalidUnit()) {
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
    if (this.time?.getTime() !== time?.getTime()) {
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
      this.timeControls.setValue(
        {
          hours: '',
          minutes: '',
          seconds: '',
          milliseconds: ''
        },
        { emitEvent: false }
      );
      this.meridian.set('am');
      this.meridianChange.emit(this.meridian());
    } else {
      const time = this.parseTime(value);
      if (!time) {
        return;
      }

      let hours = time.getHours();
      if (this.use12HourClock()) {
        // 12:00 am is midnight while 12:00 pm is noon when users enter a value greater than 12 we can assume it's pm
        this.meridian.set(hours > 12 ? 'pm' : 'am');
        this.meridianChange.emit(this.meridian());
        hours = hours % 12;
        if (hours === 0) {
          hours = 12;
        }
      }
      this.timeControls.setValue(
        {
          hours: hours.toString().padStart(2, '0'),
          minutes: time.getMinutes().toString().padStart(2, '0'),
          seconds: time.getUTCSeconds().toString().padStart(2, '0'),
          milliseconds: time.getUTCMilliseconds().toString().padStart(3, '0')
        },
        { emitEvent: false }
      );
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
    const units = this.units();
    const value = this.timeControls.value;
    let hour = this.toNumber(value.hours, units.find(u => u.name === 'hours')?.max);
    const minute = this.toNumber(value.minutes, units.find(u => u.name === 'minutes')?.max);
    const seconds = this.toNumber(value.seconds, units.find(u => u.name === 'seconds')?.max) || 0;
    const milliseconds =
      this.toNumber(value.milliseconds, units.find(u => u.name === 'milliseconds')?.max) || 0;

    if (this.isPM() && hour !== 12) {
      hour += 12;
    } else if (this.use12HourClock() && !this.isPM() && hour === 12) {
      hour = 0;
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

  private changeTimeComponent(key: string, up: boolean): void {
    const change = up ? 1 : -1;
    const date = this.createDateUpdate(new Date());
    switch (key) {
      case 'hours': {
        const newTime = this.changeTime(date, { hours: change });
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
        const newTime = this.changeTime(date, { minutes: change });
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

    if (diff.hours) {
      hour = hour + this.toNumber(diff.hours);
    }

    if (diff.minutes) {
      minutes = minutes + this.toNumber(diff.minutes);
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

  protected formatTime(time: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: this.showMinutes() ? '2-digit' : undefined,
      second: this.showSeconds() ? '2-digit' : undefined,
      hour12: this.use12HourClock(),
      fractionalSecondDigits: this.showMilliseconds() ? 3 : undefined
    };
    return new Intl.DateTimeFormat(this.locale, options).format(time);
  }
  protected validateMin(control: AbstractControl): ValidationErrors | null {
    const current = control.value;
    let min = this.min();
    if (control.value instanceof Date && min) {
      min = dateWithTime(current, min);
      if (current < min) {
        return { minTime: { actual: current, min: min, minString: this.formatTime(min) } };
      }
    }
    return null;
  }

  protected validateMax(control: AbstractControl): ValidationErrors | null {
    const error: ValidationErrors = {};
    const current = control.value;
    let max = this.max();
    if (control.value instanceof Date && max) {
      max = dateWithTime(current, max);
      if (current > max) {
        error.maxTime = { actual: current, max: max, maxString: this.formatTime(max) };
      }
    }
    return Object.keys(error).length ? error : null;
  }

  protected validateTime(name: string): ValidatorFn {
    return (c: AbstractControl): ValidationErrors | null => {
      const max = this.units().find(u => u.name === name)?.max;
      if (max !== undefined && c.value && parseInt(c.value, 10) > max) {
        return { [name]: { max } };
      }
      return null;
    };
  }
}
