/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  model,
  numberAttribute,
  signal
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { elementMinus, elementPlus } from '@siemens/element-icons';
import { SI_FORM_ITEM_CONTROL, SiFormItemControl } from '@siemens/element-ng/form';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'si-slider',
  imports: [SiIconComponent, SiTranslatePipe],
  templateUrl: './si-slider.component.html',
  styleUrl: './si-slider.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SiSliderComponent,
      multi: true
    },
    {
      provide: SI_FORM_ITEM_CONTROL,
      useExisting: SiSliderComponent
    }
  ],
  host: {
    role: 'group',
    '[class.disabled]': 'disabled()',
    '[attr.aria-labelledby]': 'labelledby()'
  }
})
export class SiSliderComponent implements ControlValueAccessor, SiFormItemControl {
  private static idCounter = 0;

  private readonly disabledNgControl = signal(false);

  /**
   * @defaultValue
   * ```
   * `__si-slider-${SiSliderComponent.idCounter++}`
   * ```
   */
  readonly id = input(`__si-slider-${SiSliderComponent.idCounter++}`);

  /**
   * Current value of slider.
   */
  readonly value = model<number>();
  /**
   * Minimum of slider range.
   *
   * @defaultValue 0
   */
  readonly min = input(0, { transform: numberAttribute });
  /**
   * Maximum of slider range.
   *
   * @defaultValue 100
   */
  readonly max = input(100, { transform: numberAttribute });
  /**
   * Label to describe minimum of slider range.
   *
   * @defaultValue ''
   */
  readonly minLabel = input('');
  /**
   * Label to describe maximum of slider range.
   *
   * @defaultValue ''
   */
  readonly maxLabel = input('');
  /**
   * Interval to step through the slider.
   *
   * @defaultValue 1
   */
  readonly step = input(1, { transform: numberAttribute });
  /**
   * Icon to use as the slider thumb.
   */
  readonly thumbIcon = input<string>();
  /**
   * Text for aria-label of increment. Needed for a11y.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_SLIDER.INCREMENT:Increment`)
   * ```
   */
  readonly incrementLabel = input(t(() => $localize`:@@SI_SLIDER.INCREMENT:Increment`));
  /**
   * Text for aria-label of decrement. Needed for a11y.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_SLIDER.DECREMENT:Decrement`)
   * ```
   */
  readonly decrementLabel = input(t(() => $localize`:@@SI_SLIDER.DECREMENT:Decrement`));
  /**
   * Text for aria-label of slider. Needed for a11y
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_SLIDER.LABEL:Value`)
   * ```
   */
  readonly sliderLabel = input(t(() => $localize`:@@SI_SLIDER.LABEL:Value`));

  /**
   * @defaultValue
   * ```
   * `${this.id()}-label`
   * ```
   */
  readonly labelledby = input(`${this.id()}-label`);

  /** @defaultValue false */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly disabledInput = input(false, { alias: 'disabled', transform: booleanAttribute });

  protected readonly disabled = computed(
    () => this.disabledInput() || this.disabledNgControl() || this.min() === this.max()
  );

  protected readonly sliderValue = computed<number>(() => {
    const value = this.value();
    if (typeof value !== 'number') {
      return this.roundToStepPrecision((this.min() + this.max()) / 2);
    }
    return value;
  });

  /**
   * This ID will be bound to the `aria-describedby` attribute of the slider.
   * Use this to reference the element containing the error message(s) for the slider.
   * It will be picked by the {@link SiFormItemComponent} if the slider is used inside a form item.
   *
   * @defaultValue
   * ```
   * `${this.id()}-errormessage`
   * ```
   */
  readonly errormessageId = input(`${this.id()}-errormessage`);

  protected readonly indicatorPos = computed(() => {
    const min = this.min();
    const max = this.max();
    const range = max - min;
    if (range <= 0) {
      return 50;
    }
    const step = this.step();
    let val = Math.min(Math.max(this.sliderValue(), min), max);
    if (step > 0) {
      const steps = Math.round((val - min) / step);
      val = min + steps * step;
      if (val > max) {
        val = Math.max(min, min + (steps - 1) * step);
      }
    }
    const indicatorPos = ((val - min) * 100) / range;
    return Math.max(Math.min(indicatorPos, 100), 0);
  });

  protected readonly icons = addIcons({ elementMinus, elementPlus });

  private autoUpdate$ = timer(400, 80); // 250
  private autoUpdateSubs?: Subscription;

  private onTouchedCallback: () => void = () => {};
  private onChangeCallback: (val: any) => void = () => {};

  constructor() {
    inject(DestroyRef).onDestroy(() => this.autoUpdateStop());
  }

  private incrementValue(): void {
    this.value.set(this.normalizeValue(this.sliderValue() + this.step()));
    this.valueChanged();
  }

  private decrementValue(): void {
    this.value.set(this.normalizeValue(this.sliderValue() - this.step()));
    this.valueChanged();
  }

  private roundToStepPrecision(value: number): number {
    const factor = 1 / this.step();
    if (factor > 1) {
      return Math.round(value * factor) / factor;
    }
    return Math.round(value / this.step()) * this.step();
  }

  private normalizeValue(value: number): number {
    return Math.min(Math.max(this.roundToStepPrecision(value), this.min()), this.max());
  }

  private valueChanged(): void {
    this.onTouchedCallback();
    this.onChangeCallback(this.sliderValue());
  }

  protected handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value.set(target.valueAsNumber);
    this.valueChanged();
  }

  protected handleBlur(): void {
    this.onTouchedCallback();
  }

  protected autoUpdateStart(event: Event, isIncrement: boolean): void {
    event.preventDefault();

    const trigger = isIncrement ? () => this.incrementValue() : () => this.decrementValue();

    this.autoUpdateSubs?.unsubscribe();
    this.autoUpdateSubs = this.autoUpdate$.subscribe(trigger);
    trigger();
  }

  protected autoUpdateStop(): void {
    if (this.autoUpdateSubs) {
      this.autoUpdateSubs.unsubscribe();
      this.autoUpdateSubs = undefined;
    }
  }

  /** @internal */
  writeValue(val: any): void {
    this.value.set(val);
  }

  /** @internal */
  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  /** @internal */
  registerOnTouched(fn: () => void): void {
    this.onTouchedCallback = fn;
  }

  /** @internal */
  setDisabledState(isDisabled: boolean): void {
    this.disabledNgControl.set(isDisabled);
  }
}
