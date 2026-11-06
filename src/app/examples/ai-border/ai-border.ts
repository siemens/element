/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiCardComponent } from '@siemens/element-ng/card';

@Component({
  selector: 'app-sample',
  imports: [SiCardComponent],
  templateUrl: './ai-border.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'p-5 bg-base-1'
  }
})
export class SampleComponent {}
