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
  HostListener,
  inject,
  input,
  model,
  NgZone,
  numberAttribute,
  signal,
  viewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { correctKeyRTL, isRTL, listenGlobal } from '@siemens/element-ng/common';
import { SI_FORM_ITEM_CONTROL, SiFormItemControl } from '@siemens/element-ng/form';
import { addIcons, elementMinus, elementPlus, SiIconNextComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'si-slider',
  imports: [SiIconNextComponent, SiTranslatePipe],
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'group',
    '[class.disabled]': 'disabled()',
    '[attr.aria-labelledby]': 'labelledby()'
  }
})
export class SiSliderComponent implements ControlValueAccessor, SiFormItemControl {
  private static idCounter = 0;

  private readonly handleRef = viewChild.required<ElementRef>('handle');

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

  /** @internal */
  readonly errormessageId = `${this.id()}-errormessage`;

  protected readonly indicatorPos = computed(() => {
    const range = this.max() - this.min();
    if (range === 0) {
      return 50;
    }
    const indicatorPos = ((this.sliderValue()! - this.min()) * 100) / range;
    return Math.max(Math.min(indicatorPos, 100), 0);
  });

  protected readonly icons = addIcons({ elementMinus, elementPlus });
  protected isDragging = false;

  private autoUpdate$ = timer(400, 80); // 250
  private autoUpdateSubs?: Subscription;
  private rtl = false;

  private unlistenDragEvents: (() => void)[] = [];

  private onTouchedCallback: () => void = () => {};
  private onChangeCallback: (val: any) => void = () => {};

  private zone = inject(NgZone);
  private changeDetectorRef = inject(ChangeDetectorRef);

  private incrementValue(): void {
    this.value.set(this.normalizeValue(this.sliderValue()! + this.step()));
    this.valueChanged();
  }

  private decrementValue(): void {
    this.value.set(this.normalizeValue(this.sliderValue()! - this.step()));
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

  private handleTouchMove(event: TouchEvent): void {
    if (event.cancelable) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.handleDragMove(event.touches[0]);
  }

  private handleMouseMove(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.handleDragMove(event);
  }

  private handleDragMove(event: MouseEvent | Touch): void {
    const pointerPosX = event.clientX;
    const handleRect = this.handleRef().nativeElement.getBoundingClientRect();
    const handleWrapperWidth = this.handleRef().nativeElement.parentElement.clientWidth;

    const direction = this.rtl ? -1 : 1;
    const pointerPosDelta =
      Math.round(pointerPosX - (handleRect.x + handleRect.width / 2)) * direction;
    const valueDelta = (pointerPosDelta / handleWrapperWidth) * (this.max() - this.min());

    const newValue = this.normalizeValue(this.sliderValue()! + valueDelta);

    if (
      (pointerPosDelta > 0 && newValue > this.sliderValue()!) ||
      (pointerPosDelta < 0 && newValue < this.sliderValue()!)
    ) {
      // the zone is required to work around a problem on native device where CD doesn't trigger
      this.zone.run(() => {
        this.changeDetectorRef.markForCheck();
        this.value.set(newValue);
        this.valueChanged();
      });
    }
    window.getSelection()?.removeAllRanges();
  }

  private handleDragEnd(): void {
    this.isDragging = false;

    this.unlistenDragEvents.forEach(handler => handler());
    this.unlistenDragEvents.length = 0;
  }

  private valueChanged(): void {
    this.onTouchedCallback();
    this.onChangeCallback(this.sliderValue());
  }

  @HostListener('pointerdown', ['$event'])
  @HostListener('mousedown', ['$event'])
  @HostListener('touchstart', ['$event'])
  protected handlePointerDown(event: Event): void {
    event.stopPropagation();
  }

  protected autoUpdateKeydown(event: KeyboardEvent): void {
    const rtlCorrectedKey = correctKeyRTL(event.key);

    if (rtlCorrectedKey === 'ArrowLeft') {
      this.autoUpdateStart(event, false);
    } else if (rtlCorrectedKey === 'ArrowRight') {
      this.autoUpdateStart(event, true);
    }
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

  protected handleMouseDown(event: MouseEvent): void {
    this.unlistenDragEvents.push(
      listenGlobal('mousemove', moveEvent => this.handleMouseMove(moveEvent))
    );
    this.unlistenDragEvents.push(listenGlobal('mouseup', () => this.handleDragEnd()));

    this.isDragging = true;

    this.rtl = isRTL();
    this.handleMouseMove(event);
  }

  protected handleTouchStart(event: TouchEvent): void {
    if (event.touches.length !== 1) {
      return;
    }

    this.unlistenDragEvents.push(listenGlobal('touchmove', e => this.handleTouchMove(e), true));
    this.unlistenDragEvents.push(listenGlobal('touchend', () => this.handleDragEnd()));

    this.isDragging = true;

    this.rtl = isRTL();
    this.handleTouchMove(event);
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
