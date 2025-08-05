/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  computed,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  numberAttribute,
  output,
  signal
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { SI_FORM_ITEM_CONTROL, SiFormItemControl } from '@siemens/element-ng/form';

@Directive({
  selector: 'input[siNumberInput]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SiNumberInputDirective,
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: SiNumberInputDirective,
      multi: true
    },
    {
      provide: SI_FORM_ITEM_CONTROL,
      useExisting: SiNumberInputDirective
    }
  ],
  host: {
    'type': 'number',
    '[attr.disabled]': 'disabled() || null',
    '[attr.id]': 'id()',
    '[attr.min]': 'min()',
    '[attr.max]': 'max()',
    '[attr.step]': 'step()',
    '[attr.readonly]': 'readonly() || null',
    '[class.readonly]': 'readonly()',
    '[value]': 'value()',
    '(input)': 'onChange($any($event.target).value)',
    '(blur)': 'onTouched()'
  }
})
export class SiNumberInputDirective implements ControlValueAccessor, SiFormItemControl, Validator {
  private static idCounter = 0;
  private static formatValidator: ValidatorFn = control => {
    if (control.value != null && isNaN(control.value)) {
      return { numberFormat: true };
    }
    return null;
  };
  private readonly inputElement = inject<ElementRef<HTMLInputElement>>(ElementRef);
  /**
   * The min. value for HTML input
   *
   * @defaultValue undefined
   */
  readonly min = input<number | undefined, unknown>(undefined, { transform: numberAttribute });
  /**
   * The max. value for HTML input
   *
   * @defaultValue undefined
   */
  readonly max = input<number | undefined, unknown>(undefined, { transform: numberAttribute });
  /**
   * ID that is set on the input, e.g. for `<label for="...">`
   *
   * @defaultValue
   * ```
   * `__si-number-input-${SiNumberInputDirective.idCounter++}`
   * ```
   */
  readonly id = input(`__si-number-input-${SiNumberInputDirective.idCounter++}`);
  /**
   * Disable the input field
   * @defaultValue false
   */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly disabledInput = input(false, { alias: 'disabled', transform: booleanAttribute });

  /**
   * Readonly state. Similar to disabled but with higher contrast
   * @defaultValue false
   */
  readonly readonly = input(false, { transform: booleanAttribute });
  /**
   * The step size for HTML input
   *
   * @defaultValue 1
   */
  readonly step = input<number | 'any'>(1);

  readonly valueChange = output<number | undefined>();

  readonly disabled = computed(() => this.disabledInput() || this.disabledNgControl());
  protected onTouched: () => void = () => {};
  protected onChange: (val: any) => void = () => {};
  protected onValidatorChanged: () => void = () => {};
  protected validator: ValidatorFn | null = SiNumberInputDirective.formatValidator;
  protected readonly value = signal<number | undefined>(undefined);
  private readonly disabledNgControl = signal(false);

  constructor() {
    effect(() => {
      const minValue = this.min();
      const maxValue = this.max();
      this.validator = Validators.compose([
        minValue != null ? Validators.min(minValue) : null,
        maxValue != null ? Validators.max(maxValue) : null,
        SiNumberInputDirective.formatValidator
      ])!;
      this.onValidatorChanged();
    });
  }

  /**
   * Decrements a range input control's value by the value given by the Step attribute.
   */
  decrement(): void {
    this.inputElement.nativeElement.stepDown();
    this.modelChanged();
    this.onTouched();
  }

  /**
   * Increments a range input control's value by the value given by the Step attribute.
   */
  increment(): void {
    this.inputElement.nativeElement.stepUp();
    this.modelChanged();
    this.onTouched();
  }

  /** @internal */
  writeValue(value: number | undefined): void {
    this.value.set(value);
  }

  /** @internal */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  /** @internal */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /** @internal */
  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChanged = fn;
  }

  /** @internal */
  setDisabledState(isDisabled: boolean): void {
    this.disabledNgControl.set(isDisabled);
  }

  /** @internal */
  validate(control: AbstractControl): ValidationErrors | null {
    return this.validator ? this.validator(control) : null;
  }

  protected modelChanged(): void {
    const value = this.inputElement.nativeElement.value
      ? this.inputElement.nativeElement.valueAsNumber
      : undefined;
    this.value.set(value);

    this.onChange(value);
    this.valueChange.emit(value);
  }
}
