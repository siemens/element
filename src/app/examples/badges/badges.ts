/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiBadgeComponent } from '@siemens/element-ng/badge';

@Component({
  selector: 'app-sample',
  templateUrl: './badges.html',
  host: {
    class: 'p-5 bg-base-1'
  },
  imports: [SiBadgeComponent]
})
export class SampleComponent {}
