/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiBadgeComponent } from '@spike-rabbit/element-ng/badge';

@Component({
  selector: 'app-sample',
  imports: [SiBadgeComponent],
  templateUrl: './badges.html',
  host: {
    class: 'p-5 bg-base-1'
  }
})
export class SampleComponent {}
