/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiBadgeComponent } from '@siemens/element-ng/badge';

@Component({
  selector: 'app-sample',
  imports: [SiBadgeComponent],
  templateUrl: './badges.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'p-5 bg-base-1'
  }
})
export class SampleComponent {}
