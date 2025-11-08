/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-sample',
  templateUrl: './buttontypes.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bg-base-1'
  }
})
export class SampleComponent {
  disabled = false;
}
