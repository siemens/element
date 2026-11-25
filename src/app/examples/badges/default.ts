/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';

@Component({
  selector: 'app-sample',
  templateUrl: './default.html',
  host: {
    class: 'p-5 background-1'
  }
})
export class SampleComponent {
  readonly variants = [
    'default',
    'primary',
    'secondary',
    'inverse',
    'info',
    'success',
    'warning',
    'danger',
    'critical',
    'caution',
    'info-emphasis',
    'success-emphasis',
    'warning-emphasis',
    'danger-emphasis',
    'critical-emphasis',
    'caution-emphasis'
  ];
}
