/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  ResultDetailStep,
  SiResultDetailsListComponent
} from '@siemens/element-ng/result-details-list';

@Component({
  selector: 'app-sample',
  imports: [SiResultDetailsListComponent],
  templateUrl: './si-result-details-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  steps: ResultDetailStep[] = [
    {
      description: 'Volume flow sensor',
      state: 'passed',
      detail: 'Additional detail about state'
    },
    {
      description: 'Maximum differential pressure',
      state: 'passed',
      value: '4 kPa'
    },
    {
      description: 'Maximum volume flow',
      state: 'failed',
      errorMessage: 'Cannot reach maximum volume flow',
      value: '20 m³/h'
    },
    {
      description: 'Nominal volume flow',
      state: 'running'
    },
    {
      description: 'Nominal differential pressure',
      state: 'not-started'
    },
    {
      description: 'A not supported step',
      state: 'not-supported'
    },
    {
      description: 'A step with a custom icon',
      state: 'failed',
      icon: 'element-lock'
    }
  ];
}
