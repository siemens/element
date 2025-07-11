/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  model,
  OnChanges,
  output
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { addIcons, elementPlus, SiIconNextComponent } from '@siemens/element-ng/icon';
import { SiNumberInputComponent } from '@siemens/element-ng/number-input';
import {
  SelectOption,
  SelectOptionLegacy,
  SiSelectComponent,
  SiSelectSimpleOptionsDirective,
  SiSelectSingleValueDirective
} from '@siemens/element-ng/select';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

import { SiReadonlyThresholdOptionComponent } from './si-readonly-threshold-option.component';

/**
 * One step in a list of thresholds
 */
export interface ThresholdStep {
  /** Threshold value, the first step has no value */
  value?: number;
  /** One of the `SelectOption.id` */
  optionValue: string;
  /** When set to `false`, input fields are highlighted as invalid */
  valid?: boolean;
}

@Component({
  selector: 'si-threshold',
  imports: [
    FormsModule,
    NgClass,
    NgTemplateOutlet,
    SiIconNextComponent,
    SiNumberInputComponent,
    SiSelectComponent,
    SiSelectSingleValueDirective,
    SiSelectSimpleOptionsDirective,
    SiTranslateModule,
    SiReadonlyThresholdOptionComponent
  ],
  templateUrl: './si-threshold.component.html',
  styleUrl: './si-threshold.component.scss',
  host: {
    '[class.add-remove]': 'canAddRemoveSteps()',
    '[class.horizontal]': 'horizontalLayout()',
    '[class.dec-inc-buttons]': 'showDecIncButtons()'
  }
})
export class SiThresholdComponent implements OnChanges {
  /**
   * Options to be shown in select dropdown
   *
   * @defaultValue []
   */
  readonly options = input<SelectOptionLegacy[] | SelectOption<unknown>[]>([]);
  /**
   * The thresholds
   *
   * @defaultValue []
   */
  readonly thresholdSteps = model<ThresholdStep[]>([]);
  /**
   * The unit to show
   *
   * @defaultValue ''
   */
  readonly unit = input('');
  /**
   * The min. value for the threshold value
   *
   * @defaultValue 0
   */
  readonly minValue = input(0);
  /**
   * The max. value for the threshold value
   *
   * @defaultValue 100
   */
  readonly maxValue = input(100);
  /**
   * The step size for the threshold value
   *
   * @defaultValue 1
   */
  readonly stepSize = input(1);
  /**
   * Max. number of steps, 0 for no hard limit
   *
   * @defaultValue 0
   */
  readonly maxSteps = input(0);
  /**
   * Do validation?
   *
   * @defaultValue true
   */
  readonly validation = input(true, { transform: booleanAttribute });
  /**
   * When disabled, steps cannot be added/removed
   *
   * @defaultValue true
   */
  readonly canAddRemoveSteps = input(true, { transform: booleanAttribute });
  /**
   * Use horizontal layout?
   *
   * @defaultValue false
   */
  readonly horizontalLayout = input(false, { transform: booleanAttribute });
  /**
   * Show dec/inc buttons?
   *
   * @defaultValue true
   */
  readonly showDecIncButtons = input(true, { transform: booleanAttribute });
  /**
   * The obvious
   *
   * @defaultValue false
   */
  readonly readonly = input(false, { transform: booleanAttribute });
  /**
   * Indicate that the threshold options are readonly and cannot be changed. This will also disable adding / removing steps.
   *
   * @defaultValue false
   */
  readonly readonlyConditions = input(false, { transform: booleanAttribute });
  /**
   * The aria-label for delete button
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_THRESHOLD.DELETE:Delete step`
   * ```
   */
  readonly deleteAriaLabel = input($localize`:@@SI_THRESHOLD.DELETE:Delete step`);
  /**
   * The aria-label for add button
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_THRESHOLD.ADD:Add step`
   * ```
   */
  readonly addAriaLabel = input($localize`:@@SI_THRESHOLD.ADD:Add step`);
  /**
   * The aria-label for input field
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_THRESHOLD.INPUT_LABEL:Threshold value`
   * ```
   */
  readonly inputAriaLabel = input($localize`:@@SI_THRESHOLD.INPUT_LABEL:Threshold value`);
  /**
   * The aria-label for status selection
   *
   * @defaultValue
   * ```
   * $localize`:@@SI_THRESHOLD.STATUS:Status`
   * ```
   */
  readonly statusAriaLabel = input($localize`:@@SI_THRESHOLD.STATUS:Status`);

  /** Fired when validation status changes */
  readonly validChange = output<boolean>();

  protected readonly colors = computed(() => {
    const colorMap = new Map<unknown, string>();
    for (const opt of this.options()) {
      if (opt.type === 'option') {
        colorMap.set(opt.value, opt.iconColor ?? '');
      } else if (!opt.type) {
        colorMap.set(opt.id, opt.color ?? '');
      }
    }
    return this.thresholdSteps().map(ths => colorMap.get(ths.optionValue) ?? '');
  });

  protected readonly icons = addIcons({ elementPlus });
  private _valid = true;
  /**
   * Whether the current input value is valid or not.
   */
  get valid(): boolean {
    return this._valid;
  }
  private element = inject(ElementRef);

  ngOnChanges(): void {
    this.validate();
  }

  protected deleteStep(index: number): void {
    const updated = [...this.thresholdSteps()];
    updated.splice(index, 1);
    this.thresholdSteps.set(updated);
    this.validate();
  }

  protected addStep(index: number): void {
    const newStep: ThresholdStep = { ...this.thresholdSteps()[index], value: undefined };
    const updated = [...this.thresholdSteps()];
    updated.splice(index + 1, 0, newStep);
    this.thresholdSteps.set(updated);
    this.validate();
    setTimeout(() =>
      this.element.nativeElement.querySelectorAll('input.form-control')[index]?.focus()
    );
  }

  protected stepChange(): void {
    this.thresholdSteps.set([...this.thresholdSteps()]);
    this.validate();
  }

  private validate(): void {
    const prevValid = this.valid;
    this._valid = true;
    for (let i = 1; i < this.thresholdSteps().length; i++) {
      const step = this.thresholdSteps()[i];

      if (this.validation()) {
        const prev = this.thresholdSteps()[i - 1];
        const next = this.thresholdSteps()[i + 1];

        // valid: withing min/max, each step is lower than next step with step size between
        step.valid =
          step.value != null &&
          step.value >= this.minValue() &&
          step.value <= this.maxValue() &&
          (prev.value == null || step.value - this.stepSize() >= prev.value) &&
          (next?.value == null || step.value + this.stepSize() <= next.value);
        this._valid &&= step.valid;
      } else {
        step.valid = true;
      }
    }
    if (this.valid !== prevValid) {
      this.validChange.emit(this.valid);
    }
  }
}
