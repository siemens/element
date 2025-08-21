/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';
import {
  MicrochartBarSeries,
  SiMicrochartBarComponent
} from '@siemens/native-charts-ng/microchart-bar';
import {
  MicrochartDonutSeries,
  SiMicrochartDonutComponent
} from '@siemens/native-charts-ng/microchart-donut';
import {
  MicrochartLineSeries,
  SiMicrochartLineComponent
} from '@siemens/native-charts-ng/microchart-line';
import {
  MicrochartProgressSeries,
  SiMicrochartProgressComponent
} from '@siemens/native-charts-ng/microchart-progress';

@Component({
  selector: 'app-sample',
  imports: [
    SiMicrochartDonutComponent,
    SiMicrochartBarComponent,
    SiMicrochartLineComponent,
    SiMicrochartProgressComponent,
    SiIconComponent
  ],
  templateUrl: './si-micro-charts.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'p-5'
  }
})
export class SampleComponent {
  donutSeries: MicrochartDonutSeries[] = [{ valuePercent: 40, colorToken: 'element-data-4' }];
  barSeries: MicrochartBarSeries = {
    values: [2, 4, 5, 3, 5, 7, 7, 9, 11, 10, 12, 9],
    colorToken: 'element-data-7'
  };
  lineSeries: MicrochartLineSeries = {
    values: [2, 3, 6, 5, 4, 7, 8],
    colorToken: 'element-data-10'
  };
  progressSeries: MicrochartProgressSeries = { valuePercent: 80, colorToken: 'element-data-2' };
}
