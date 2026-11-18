/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import {
  ResultDetailStep,
  SiResultDetailsListComponent
} from '@siemens/element-ng/result-details-list';

@Component({
  selector: 'app-sample',
  imports: [SiResultDetailsListComponent],
  templateUrl: './si-result-details-list-horizontal.html',
  host: { class: 'p-5' }
})
export class SampleComponent {
  readonly steps: ResultDetailStep[] = [
    {
      description: 'Supply voltage',
      state: 'passed',
      detail: 'Within the configured range',
      value: '24 V'
    },
    {
      description: 'Verify communication with the backup control unit',
      state: 'running'
    },
    {
      description: 'Cooling circuit',
      state: 'failed',
      errorMessage: 'Flow is below the required minimum',
      value: '8 L/min'
    },
    {
      description: 'Safety relay',
      state: 'not-started'
    },
    {
      description: 'Optional sensor',
      state: 'not-supported',
      detail: 'This installation has no optional sensor'
    },
    {
      description: 'Service access',
      state: 'passed',
      icon: 'element-lock',
      value: 'Locked'
    }
  ];
}
