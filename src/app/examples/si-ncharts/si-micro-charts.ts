/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MicroDonutSeries, SiMicroDonutComponent } from '@siemens/native-charts-ng/micro-donut';

@Component({
  selector: 'app-sample',
  imports: [SiMicroDonutComponent],
  templateUrl: './si-micro-charts.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'p-5'
  }
})
export class SampleComponent {
  series: MicroDonutSeries[] = [{ valuePercent: 40, colorToken: 'element-data-4' }];
}
