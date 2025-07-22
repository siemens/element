/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  numberAttribute,
  OnChanges,
  output,
  signal,
  SimpleChanges,
  viewChild
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
import { addIcons, elementMinus, elementPlus, SiIconNextComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe, TranslatableString } from '@siemens/element-translate-ng/translate';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'si-number-input',
  imports: [SiIconNextComponent, SiTranslatePipe],
  templateUrl: './si-number-input.component.html',
  styleUrl: './si-number-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SiNumberInputComponent,
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: SiNumberInputComponent,
      multi: true
    },
    {
      provide: SI_FORM_ITEM_CONTROL,
      useExisting: SiNumberInputComponent
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.show-step-buttons]': 'showButtons()',
    '[class.disabled]': 'disabled()',
    '[class.readonly]': 'readonly()'
  }
})
export class SiNumberInputComponent
  implements OnChanges, ControlValueAccessor, Validator, SiFormItemControl
{
  private static idCounter = 0;
  private static formatValidator: ValidatorFn = control => {
    if (control.value != null && isNaN(control.value)) {
      return { numberFormat: true };
    }
    return null;
  };

  /**
   * The min. value for HTML input
   *
   * @defaultValue undefined
   */
  readonly minInput = input<number | undefined, unknown>(undefined, {
    // eslint-disable-next-line @angular-eslint/no-input-rename
    alias: 'min',
    transform: numberAttribute
  });
  /**
   * The max. value for HTML input
   *
   * @defaultValue undefined
   */
  readonly maxInput = input<number | undefined, unknown>(undefined, {
    // eslint-disable-next-line @angular-eslint/no-input-rename
    alias: 'max',
    transform: numberAttribute
  });
  /**
   * The step size for HTML input
   *
   * @defaultValue 1
   */
  readonly step = input<number | 'any'>(1);
  /** The value */
  readonly value = input<number>();
  /** Optional unit label */
  readonly unit = input<string>();
  /**
   * Show increment/decrement buttons?
   *
   * @defaultValue true
   */
  readonly showButtons = input(true, { transform: booleanAttribute });
  /**
   * The aria-label passed to the input
   *
   * @defaultValue undefined
   */
  readonly ariaLabel = input<TranslatableString>(undefined, { alias: 'aria-label' });
  /**
   * ID that is set on the input, e.g. for `<label for="...">`
   *
   * @defaultValue
   * ```
   * `__si-number-input-${SiNumberInputComponent.idCounter++}`
   * ```
   */
  readonly inputId = input(`__si-number-input-${SiNumberInputComponent.idCounter++}`);

  readonly id = computed(() => this.inputId());

  /** @defaultValue false */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly disabledInput = input(false, { alias: 'disabled', transform: booleanAttribute });
  /** @defaultValue false */
  readonly readonly = input(false, { transform: booleanAttribute });

  /**
   * The placeholder for input field.
   */
  readonly placeholder = input<TranslatableString>();

  readonly valueChange = output<number | undefined>();

  readonly inputElement = viewChild.required<ElementRef<HTMLInputElement>>('inputElement');

  /** @internal */
  readonly errormessageId = `${this.id()}-errormessage`;

  protected canInc = true;
  protected canDec = true;
  protected readonly disabled = computed(() => this.disabledInput() || this.disabledNgControl());
  private readonly disabledNgControl = signal(false);
  protected onTouched: () => void = () => {};
  protected onChange: (val: any) => void = () => {};
  protected validator: ValidatorFn | null = SiNumberInputComponent.formatValidator;
  protected onValidatorChanged: () => void = () => {};
  protected readonly min = computed(() => {
    const minVal = this.minInput();
    return minVal === undefined || isNaN(minVal) ? undefined : minVal;
  });
  protected readonly max = computed(() => {
    const maxVal = this.maxInput();
    return maxVal === undefined || isNaN(maxVal) ? undefined : maxVal;
  });
  protected readonly icons = addIcons({ elementMinus, elementPlus });
  private internalValue?: number;
  private autoUpdate$ = timer(400, 80);
  private autoUpdateSubs?: Subscription;
  private changeDetectorRef = inject(ChangeDetectorRef);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.value) {
      this.writeValueToInput(this.value());
    }
    if (changes.minInput || changes.maxInput) {
      const minValue = this.min();
      const maxValue = this.max();
      this.validator = Validators.compose([
        minValue != null ? Validators.min(minValue) : null,
        maxValue != null ? Validators.max(maxValue) : null,
        SiNumberInputComponent.formatValidator
      ])!;
      this.onValidatorChanged();
    }
    this.updateStepButtons();
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
  setDisabledState(isDisabled: boolean): void {
    this.disabledNgControl.set(isDisabled);
  }

  /** @internal */
  writeValue(value: number | undefined): void {
    this.writeValueToInput(value);
    this.updateStepButtons();
    this.changeDetectorRef.markForCheck();
  }

  /** @internal */
  validate(control: AbstractControl): ValidationErrors | null {
    return this.validator ? this.validator(control) : null;
  }

  /** @internal */
  registerOnValidatorChange?(fn: () => void): void {
    this.onValidatorChanged = fn;
  }

  protected modelChanged(): void {
    const value = this.inputElement().nativeElement.value
      ? this.inputElement().nativeElement.valueAsNumber
      : undefined;
    this.internalValue = value;
    this.updateStepButtons();
    this.onChange(value);
    this.valueChange.emit(value);
  }

  protected autoUpdateStart(event: Event, isIncrement: boolean): void {
    const mouseButton = (event as MouseEvent).button;
    if (mouseButton) {
      return;
    }

    this.onTouched();
    event.preventDefault();
    const trigger = isIncrement ? () => this.increment() : () => this.decrement();
    this.autoUpdateSubs?.unsubscribe();
    this.autoUpdateSubs = this.autoUpdate$.subscribe(trigger);
    trigger();
  }

  protected autoUpdateStop(): void {
    this.autoUpdateSubs?.unsubscribe();
    this.autoUpdateSubs = undefined;
  }

  private updateStepButtons(): void {
    const stepValue = this.step();
    const step = typeof stepValue === 'number' ? stepValue : 1;
    const max = this.max();
    this.canInc = max == null || this.internalValue == null || this.internalValue + step <= max;
    const min = this.min();
    this.canDec = min == null || this.internalValue == null || this.internalValue - step >= min;
    if (!this.canInc || !this.canDec) {
      this.autoUpdateStop();
    }
  }

  private decrement(): void {
    this.inputElement().nativeElement.stepDown();
    this.modelChanged();
  }

  private increment(): void {
    this.inputElement().nativeElement.stepUp();
    this.modelChanged();
  }

  private writeValueToInput(value: number | undefined): void {
    this.inputElement().nativeElement.value = value == null ? '' : value.toString();
    this.internalValue = value;
  }
}
