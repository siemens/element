/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { A11yModule } from '@angular/cdk/a11y';
import {
  AfterViewInit,
  booleanAttribute,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  computed,
  ElementRef,
  HostAttributeToken,
  HostListener,
  inject,
  input,
  model,
  OnChanges,
  output,
  signal,
  SimpleChanges,
  viewChild,
  viewChildren
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormsModule,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  NgModel,
  ValidationErrors,
  Validator,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {
  positionBottomCenter,
  positionBottomEnd,
  positionBottomStart,
  positionTopCenter,
  positionTopEnd,
  positionTopStart
} from '@siemens/element-ng/common';
import { SI_FORM_ITEM_CONTROL, SiFormItemControl } from '@siemens/element-ng/form';
import { addIcons, elementCalendar, SiIconNextComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe, t, TranslatableString } from '@siemens/element-translate-ng/translate';

import { getMaxDate, getMinDate } from './date-time-helper';
import { SiDateInputDirective } from './si-date-input.directive';
import { SiDatepickerOverlayComponent } from './si-datepicker-overlay.component';
import { CloseCause, SiDatepickerOverlayDirective } from './si-datepicker-overlay.directive';
import { DatepickerInputConfig, DateRange } from './si-datepicker.model';

@Component({
  selector: 'si-date-range',
  imports: [FormsModule, SiDateInputDirective, SiIconNextComponent, SiTranslatePipe, A11yModule],
  templateUrl: './si-date-range.component.html',
  styleUrl: './si-date-range.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SiDateRangeComponent,
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: SiDateRangeComponent,
      multi: true
    },
    {
      provide: SI_FORM_ITEM_CONTROL,
      useExisting: SiDateRangeComponent
    }
  ],
  host: {
    class: 'form-control d-flex align-items-center pe-2',
    role: 'group',
    '[class.disabled]': 'disabled()',
    '[class.readonly]': 'readonly()',
    '[attr.aria-labelledby]': 'labelledby'
  },
  hostDirectives: [
    {
      directive: SiDatepickerOverlayDirective,
      outputs: ['siDatepickerClose']
    }
  ]
})
export class SiDateRangeComponent
  implements ControlValueAccessor, Validator, AfterViewInit, OnChanges, SiFormItemControl
{
  private static idCounter = 0;
  private readonly inputDirectives = viewChildren(SiDateInputDirective);
  private readonly startInput = viewChild.required<NgModel>('startInput');
  private readonly endInput = viewChild.required<NgModel>('endInput');
  private readonly button = viewChild.required<ElementRef>('button');
  /**
   * @defaultValue
   * ```
   * `__si-date-range-${SiDateRangeComponent.idCounter++}`
   * ```
   */
  readonly id = input(`__si-date-range-${SiDateRangeComponent.idCounter++}`);

  readonly labelledby =
    inject(new HostAttributeToken('aria-labelledby'), {
      optional: true
    }) ?? `${this.id()}-label`;

  /**
   * Date range component configuration.
   *
   * @defaultValue
   * ```
   * { enableDateRange: true }
   * ```
   */
  readonly siDatepickerConfig = model<DatepickerInputConfig>({ enableDateRange: true });
  /**
   * Placeholder of the start date input.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_DATEPICKER.START_DATE_PLACEHOLDER:Start date`)
   * ```
   */
  readonly startDatePlaceholder = input<TranslatableString>(
    t(() => $localize`:@@SI_DATEPICKER.START_DATE_PLACEHOLDER:Start date`)
  );
  /**
   * Placeholder of the end date input.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_DATEPICKER.END_DATE_PLACEHOLDER:End date`)
   * ```
   */
  readonly endDatePlaceholder = input<TranslatableString>(
    t(() => $localize`:@@SI_DATEPICKER.END_DATE_PLACEHOLDER:End date`)
  );
  /**
   * Aria label of the date-range calendar toggle button.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_DATEPICKER.CALENDAR_TOGGLE_BUTTON:Open calendar`)
   * ```
   */
  readonly ariaLabelCalendarButton = input<TranslatableString>(
    t(() => $localize`:@@SI_DATEPICKER.CALENDAR_TOGGLE_BUTTON:Open calendar`)
  );
  /**
   * Form label of the start timepicker.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_DATEPICKER.START_TIME_LABEL:from`)
   * ```
   */
  readonly startTimeLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_DATEPICKER.START_TIME_LABEL:from`)
  );
  /**
   * Form label of the start timepicker.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_DATEPICKER.END_TIME_LABEL:to`)
   * ```
   */
  readonly endTimeLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_DATEPICKER.END_TIME_LABEL:to`)
  );
  /**
   * Automatically close overlay on date selection.
   *
   * @defaultValue false
   */
  readonly autoClose = input(false, { transform: booleanAttribute });
  /** Emits on the date range value changes. */
  readonly siDatepickerRangeChange = output<DateRange | undefined>();
  /**
   * Emits an event to notify about disabling the time from the range picker.
   * When time is disable, we construct a pure date objects in UTC 00:00:00 time.
   */
  readonly disabledTimeChange = output<boolean>();

  /**
   * Whether the date range input is disabled.
   *
   * @defaultValue false
   */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly disabledInput = input(false, { alias: 'disabled' });

  /**
   * Whether the date range input is readonly.
   *
   * @defaultValue false
   */
  readonly readonly = input(false, { transform: booleanAttribute });

  /**
   * Set the date-range object displayed in the control.
   * The input can be used if the control is used outside Angular forms.
   */
  readonly value = model<DateRange>();

  /** @internal */
  readonly errormessageId = `${this.id()}-errormessage`;

  private validator!: ValidatorFn;
  private onChange = (val: any): void => {};
  private onTouch = (): void => {};

  protected readonly icons = addIcons({ elementCalendar });
  protected readonly disabled = computed(() => this.disabledInput() || this.disabledNgControl());
  private readonly disabledNgControl = signal(false);
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly overlayToggle = inject(SiDatepickerOverlayDirective);
  private readonly elementRef = inject(ElementRef);
  private readonly defaultPlacement = [
    positionBottomCenter,
    positionBottomStart,
    positionBottomEnd,
    positionTopCenter,
    positionTopStart,
    positionTopEnd
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.siDatepickerConfig) {
      this.siDatepickerConfig.set({
        ...changes.siDatepickerConfig.currentValue,
        enableDateRange: true,
        startTimeLabel:
          changes.siDatepickerConfig.currentValue.startTimeLabel ?? this.startTimeLabel(),
        endTimeLabel: changes.siDatepickerConfig.currentValue.endTimeLabel ?? this.endTimeLabel()
      });
      if (changes.value) {
        this.updateValue(this.value());
      }
    }
    this.overlayToggle.setInputs({ config: this.siDatepickerConfig(), dateRange: this.value() });
  }

  ngAfterViewInit(): void {
    this.validator = Validators.compose([
      () => this.endAfterStartValidator(),
      this.childValidation
    ])!;

    this.overlayToggle.placement.set(this.defaultPlacement);
    this.overlayToggle.siDatepickerClose.subscribe(cause => {
      if ([CloseCause.Escape, CloseCause.Select].includes(cause)) {
        this.button().nativeElement.focus();
      } else {
        // Mark component as touch when the focus isn't recovered on input
        this.onTouch();
        this.cdRef.markForCheck();
      }
    });
  }

  writeValue(dateRange: DateRange): void {
    this.updateValue(dateRange);
    this.overlayToggle.setInputs({ dateRange });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledNgControl.set(isDisabled);
  }

  validate(c: AbstractControl): ValidationErrors | null {
    return this.validator ? this.validator(c) : null;
  }

  /**
   * Focus out shall close the datepicker except we are moving the focus to the datepicker or one of the input elements.
   * @param event - focus out event with the related target
   */
  @HostListener('focusout', ['$event'])
  protected onFocusOut(event: FocusEvent): void {
    const target = event.relatedTarget as HTMLInputElement;
    if (!this.overlayToggle.contains(target)) {
      this.overlayToggle.closeOverlay();

      // Only mark the component as touched when the focus is not moved to the datepicker or one of the input elements.
      if (!this.elementRef.nativeElement.contains(target)) {
        this.onTouch();
      }
    }
  }

  /** Forward date range input changes to datepicker overlay */
  protected onInputChanged(dateRange: DateRange): void {
    this.updateValue(dateRange);

    this.onChange(this.value());
    this.siDatepickerRangeChange.emit(this.value());
  }

  protected show(): void {
    if (this.readonly() || this.disabled()) {
      return;
    }
    this.subscribeRangeChanges(
      this.overlayToggle.showOverlay(true, {
        config: this.siDatepickerConfig(),
        dateRange: this.value()
      })
    );
  }

  private subscribeRangeChanges(overlay?: ComponentRef<SiDatepickerOverlayComponent>): void {
    overlay?.instance.dateRange.subscribe(d => this.onRangeChanged(d));
    overlay?.instance.disabledTimeChange.subscribe(disabledTime => {
      this.inputDirectives().forEach(inputDirective => inputDirective.onDisabledTime(disabledTime));
      this.disabledTimeChange.emit(disabledTime);
    });
  }

  private onRangeChanged(range?: DateRange): void {
    this.updateValue(range);
    this.onChange(range);
    this.siDatepickerRangeChange.emit(range);
    this.validateChildren();

    if (this.autoClose() && this.value()?.start && this.value()?.end) {
      // We have to queue the close in the another cycle since other output event
      // emitters like rangeTypeChange can complete before we destroy the overlay.
      setTimeout(() => this.overlayToggle.closeAfterSelection());
    }
  }

  /** Run validators on the start/end inputs. */
  private validateChildren(): void {
    this.inputDirectives().forEach(d => d.validatorOnChange());
  }

  /** The form control validator for the end date is greater equal start date. */
  private endAfterStartValidator(): ValidationErrors | null {
    const endDate = this.endInput().value;
    const startDate = this.startInput().value;

    return !endDate || !startDate || endDate >= startDate
      ? null
      : {
          endBeforeStart: {
            start: startDate,
            end: endDate
          }
        };
  }

  private readonly childValidation: ValidatorFn = () => {
    const errors: Record<string, any> = {};
    this.readErrorsFromInnerControl(this.startInput(), 'Start', errors);
    this.readErrorsFromInnerControl(this.endInput(), 'End', errors);

    if (Object.keys(errors).length) {
      return errors;
    }

    return null;
  };

  private readErrorsFromInnerControl(
    control: NgModel,
    type: 'Start' | 'End',
    errors: Record<string, any>
  ): void {
    if (control.invalid) {
      const formatError = control.getError('dateFormat');
      if (formatError) {
        errors[`invalid${type}DateFormat`] = formatError;
      }
      const minError = control.getError('minDate');
      const siDatepickerConfig = this.siDatepickerConfig();
      if (minError) {
        errors.rangeBeforeMinDate = {
          min: getMinDate(siDatepickerConfig.minDate),
          start: this.startInput().value,
          end: this.endInput().value
        };
      }
      const maxError = control.getError('maxDate');
      if (maxError) {
        errors.rangeAfterMaxDate = {
          max: getMaxDate(siDatepickerConfig.maxDate),
          start: this.startInput().value,
          end: this.endInput().value
        };
      }
    }
  }

  private updateValue(value?: DateRange): void {
    // this allows angular's built in required validator to work correctly
    if (!value?.start && !value?.end) {
      this.value.set(undefined);
    } else {
      this.value.set(value);
    }
  }
}
