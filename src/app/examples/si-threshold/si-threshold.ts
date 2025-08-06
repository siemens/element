/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiFormItemComponent } from '@spike-rabbit/element-ng/form';
import { SiNumberInputComponent } from '@spike-rabbit/element-ng/number-input';
import { SelectOption } from '@spike-rabbit/element-ng/select';
import { SiThresholdComponent, ThresholdStep } from '@spike-rabbit/element-ng/threshold';

@Component({
  selector: 'app-sample',
  imports: [FormsModule, SiFormItemComponent, SiNumberInputComponent, SiThresholdComponent],
  templateUrl: './si-threshold.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  readonly optionsList: SelectOption<string>[] = [
    {
      type: 'option',
      value: 'very-good',
      icon: 'element-circle-filled',
      iconColor: 'status-success',
      stackedIcon: 'element-state-face-very-happy',
      stackedIconColor: 'status-success-contrast',
      label: 'Very good'
    },
    {
      type: 'option',
      value: 'good',
      icon: 'element-circle-filled',
      iconColor: 'status-success',
      stackedIcon: 'element-state-face-happy',
      stackedIconColor: 'status-success-contrast',
      label: 'Good'
    },
    {
      type: 'option',
      value: 'average',
      icon: 'element-circle-filled',
      iconColor: 'status-warning',
      stackedIcon: 'element-state-face-neutral',
      stackedIconColor: 'status-warning-contrast',
      label: 'Average'
    },
    {
      type: 'option',
      value: 'poor',
      icon: 'element-circle-filled',
      iconColor: 'status-danger',
      stackedIcon: 'element-state-face-unhappy',
      stackedIconColor: 'status-danger-contrast',
      label: 'Poor'
    },
    {
      type: 'option',
      value: 'unhealthy',
      icon: 'element-circle-filled',
      iconColor: 'status-critical',
      stackedIcon: 'element-state-face-very-unhappy',
      stackedIconColor: 'status-critical-contrast',
      label: 'Unhealthy'
    }
  ];

  readonly thresholdSteps: ThresholdStep[] = [
    { value: undefined, optionValue: 'unhealthy' },
    { value: 10, optionValue: 'poor' },
    { value: 15, optionValue: 'average' },
    { value: 20, optionValue: 'good' },
    { value: 23, optionValue: 'very-good' },
    { value: 26, optionValue: 'good' },
    { value: 28, optionValue: 'average' },
    { value: 33, optionValue: 'poor' },
    { value: 40, optionValue: 'unhealthy' }
  ];

  canAddRemove = true;
  maxSteps = 15;
  horizontalLayout = false;
  readonly = false;
  readonlyConditions = false;
  minValue = -10;
  maxValue = 50;
  stepSize = 1;
  unit = '°C';
  showDecIncButtons = true;
  validation = true;
  valid = true;
  wrap = false;
}
