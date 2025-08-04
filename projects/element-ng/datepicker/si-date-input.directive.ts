/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { formatDate } from '@angular/common';
import {
  booleanAttribute,
  computed,
  Directive,
  HostListener,
  inject,
  input,
  LOCALE_ID,
  model,
  OnChanges,
  output,
  signal,
  SimpleChanges
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
  Validators
} from '@angular/forms';
import { SI_FORM_ITEM_CONTROL, SiFormItemControl } from '@siemens/element-ng/form';

import { compareDate, getMaxDate, getMinDate, isValid, parseDate } from './date-time-helper';
import { DatepickerInputConfig, getDatepickerFormat } from './si-datepicker.model';

/**
 * Base directive for date input fields.
 */
@Directive({
  selector: 'input[siDateInput]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SiDateInputDirective,
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: SiDateInputDirective,
      multi: true
    },
    {
      provide: SI_FORM_ITEM_CONTROL,
      useExisting: SiDateInputDirective
    }
  ],
  host: {
    '[attr.id]': 'id()',
    '[attr.disabled]': 'disabled() || null',
    '[attr.readonly]': 'readonly() || null',
    '[class.readonly]': 'readonly()',
    '[attr.aria-describedby]': 'errormessageId()',
    '[value]': 'dateString()'
  },
  exportAs: 'siDateInput'
})
export class SiDateInputDirective
  implements ControlValueAccessor, OnChanges, Validator, SiFormItemControl
{
  private static idCounter = 0;

  /**
   * @defaultValue
   * ```
   * `si-date-input-${SiDateInputDirective.idCounter++}`
   * ```
   */
  readonly id = input(`si-date-input-${SiDateInputDirective.idCounter++}`);

  /**
   * Configuration object for the datepicker.
   *
   * @defaultValue
   * ```
   * {}
   * ```
   */
  readonly siDatepickerConfig = model<DatepickerInputConfig | undefined>({});

  /**
   * Emits an event to notify about disabling the time from the datepicker.
   * When time is disable, we construct a pure date object in UTC 00:00:00 time.
   */
  readonly siDatepickerDisabledTime = output<boolean>();
  /**
   * Emits an event on state changes e.g. readonly, disable, ... .
   */
  readonly stateChange = output<void>();
  /**
   * Whether the date range input is disabled.
   * @defaultValue false
   */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly disabledInput = input(false, { alias: 'disabled' });

  /**
   * Whether the date range input is readonly.
   * @defaultValue false
   */
  readonly readonly = input(false, { transform: booleanAttribute });

  /**
   * Overrides the value of aria-describedby
   *
   * @defaultValue
   * ```
   * `${this.id()}-errormessage`
   * ```
   */
  readonly errormessageId = input(`${this.id()}-errormessage`);

  /** @internal */
  validatorOnChange = (): void => {};
  /**
   * Date form input validator function, validating text format, min and max value.
   */
  protected validator = Validators.compose([
    () => this.formatValidator(),
    () => this.minValidator(),
    () => this.maxValidator()
  ])!;
  protected date?: Date;
  /**
   * Emits a new `date` value on input field value changes.
   */
  protected readonly dateChange = output<Date | undefined>();
  /** @internal */
  public readonly disabled = computed(() => this.disabledInput() || this.disabledNgControl());
  protected onTouched: () => void = () => {};
  protected onModelChange: (value: any) => void = () => {};
  protected readonly dateString = signal('');
  private readonly disabledNgControl = signal(false);
  protected readonly locale = inject(LOCALE_ID).toString();
  private format = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.siDatepickerConfig && !changes.siDatepickerConfig.currentValue) {
      this.siDatepickerConfig.set({});
    }
    if (changes.readonly || changes.disabledInput) {
      this.stateChange.emit();
    }
    if (changes.siDatepickerConfig) {
      // reflect possible change is date/time format
      const format = this.format;
      this.format = '';
      this.getFormat();
      const formatChanged = format !== this.format;
      if (this.date && formatChanged) {
        this.updateNativeValue();
      }
    }
  }

  validate(c: AbstractControl): ValidationErrors | null {
    return this.validator(c);
  }

  registerOnChange(fn: any): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.validatorOnChange = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledNgControl.set(isDisabled);
    this.stateChange.emit();
  }

  writeValue(value?: Date | string): void {
    // remove date when user input is empty
    let emptyString = false;
    // Flag to define invalid string
    let invalidDate = false;
    if (typeof value === 'string') {
      emptyString = value.trim().length === 0;
      value = parseDate(value, this.getFormat(), this.locale);
      invalidDate = !value;
    }

    // Only emit changes to prevent that a destroyed output emit a value
    if (this.date !== value) {
      this.date = value;
      this.dateChange.emit(this.date);

      // We should not change the content of the input field when the user typed
      // a wrong input. Otherwise the typed content changes and the user cannot
      // correct the content.
      if (!invalidDate || emptyString) {
        this.updateNativeValue();
      }
    }
  }

  private updateNativeValue(): void {
    let dtStr = '';
    if (isValid(this.date)) {
      dtStr = formatDate(this.date, this.getFormat(), this.locale);
    }
    this.dateString.set(dtStr);
  }

  /**
   * Handles `input` events on the input element.
   * @param value - current input value.
   */
  @HostListener('input', ['$event'])
  protected onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const parsedDate = parseDate(value, this.getFormat(), this.locale);

    // Is same date
    const hasChanged = !(parsedDate === this.date);
    if (hasChanged) {
      this.date = parsedDate;
      this.onModelChange(this.date);
      this.dateChange.emit(this.date);
    }
  }

  @HostListener('blur', ['$event']) protected onBlur(event: FocusEvent): void {
    this.onTouched();
  }

  private getFormat(): string {
    if (!this.format) {
      this.format = getDatepickerFormat(this.locale, this.siDatepickerConfig());
    }
    return this.format;
  }

  /**
   * Callback when the datepicker changes his value.
   * @param date - updated date
   */
  protected onDateChanged(date?: Date): void {
    // update input element
    this.writeValue(date);
    // update the Forms ngModel
    this.onModelChange(this.date);
  }

  /**
   * Datepicker consider time / ignore time changed.
   * @param disabledTime - disable time
   * @internal
   */
  onDisabledTime(disabledTime: boolean): void {
    this.format = '';
    // Temporary reset internal date to force an update with the new date format
    const currentDate = this.date;
    this.date = undefined;
    this.siDatepickerConfig()!.disabledTime = disabledTime;
    // Ensure the time format will be removed
    this.onDateChanged(currentDate);
    this.siDatepickerDisabledTime.emit(disabledTime);
  }

  /** The form control validator for date format */
  private formatValidator(): ValidationErrors | null {
    const invalidFormat = this.date && isNaN(this.date.getTime());
    return invalidFormat ? { dateFormat: { format: this.getFormat() } } : null;
  }

  /** The form control validator for the min date. */
  private minValidator(): ValidationErrors | null {
    const controlValue = this.date;
    const siDatepickerConfig = this.siDatepickerConfig();
    const min = getMinDate(siDatepickerConfig?.minDate);
    const withTime = siDatepickerConfig?.showTime;

    return !min ||
      !isValid(controlValue) ||
      (withTime ? controlValue >= min : compareDate(controlValue, min) >= 0)
      ? null
      : { minDate: { min, actual: controlValue } };
  }

  /** The form control validator for the min date. */
  private maxValidator(): ValidationErrors | null {
    const controlValue = this.date;
    const siDatepickerConfig = this.siDatepickerConfig();
    const max = getMaxDate(siDatepickerConfig?.maxDate);
    const withTime = siDatepickerConfig?.showTime;

    return !max ||
      !isValid(controlValue) ||
      (withTime ? controlValue <= max : compareDate(controlValue, max) <= 0)
      ? null
      : { maxDate: { max, actual: controlValue } };
  }
}
