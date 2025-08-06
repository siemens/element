/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MicroLineSeries, SiMicroLineComponent } from '@siemens/native-charts-ng/micro-line';

@Component({
  selector: 'app-sample',
  imports: [SiMicroLineComponent],
  templateUrl: './si-micro-line.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'p-5'
  }
})
export class SampleComponent {
  series: MicroLineSeries = { values: [2, 3, 6, 5, 4, 7, 8], colorToken: 'element-data-10' };
}
