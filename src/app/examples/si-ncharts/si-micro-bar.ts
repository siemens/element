/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MicroBarSeries, SiMicroBarComponent } from '@siemens/native-charts-ng/micro-bar';

@Component({
  selector: 'app-sample',
  imports: [SiMicroBarComponent],
  templateUrl: './si-micro-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'p-5'
  }
})
export class SampleComponent {
  series: MicroBarSeries = {
    values: [2, 4, 5, 3, 5, 7, 7, 9, 11, 10, 12, 9],
    colorToken: 'element-data-7'
  };
}
