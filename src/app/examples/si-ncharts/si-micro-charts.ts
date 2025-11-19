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
  donutSeries1: MicrochartDonutSeries[] = [{ valuePercent: 40, colorToken: 'element-data-4' }];
  donutSeries2: MicrochartDonutSeries[] = [{ valuePercent: 75, colorToken: 'element-data-15' }];
  donutSeriesMulti: MicrochartDonutSeries[] = [
    { valuePercent: 25, colorToken: 'element-data-10' },
    { valuePercent: 50, colorToken: 'element-data-5' }
  ];
  barSeries: MicrochartBarSeries = {
    values: [3, 7, 2, 8, 5, 9, 4, 6, 8, 7, 5, 9],
    colorToken: 'element-data-7'
  };

  mixedSeries: MicrochartBarSeries = {
    values: [5, -12, 18, -25, 30, -8, 15, -20, 22, -15, 28, -18],
    colorToken: 'element-data-3'
  };

  mixedSeries2: MicrochartBarSeries = {
    values: [5, -12, 18, -25, 30, -8, 15, -20, 22, -15, 28, -18],
    colorToken: 'element-data-3',
    negativeColorToken: 'element-data-10'
  };

  whiskerChart: MicrochartBarSeries = {
    values: [25, 25, 25, -25, -25, 25, 25, -25, 25, 25, 25],
    colorToken: 'element-data-3',
    negativeColorToken: 'element-data-10'
  };

  positiveSeries: MicrochartBarSeries = {
    values: [5, 8, 12, 18, 25, 30, 38, 42, 48, 55, 62, 70],
    colorToken: 'element-data-2'
  };

  negativeSeries: MicrochartBarSeries = {
    values: [-5, -8, -12, -18, -25, -30, -38, -42, -48, -55, -62, -70],
    colorToken: 'element-data-9'
  };

  lineSeries: MicrochartLineSeries = {
    values: [2, 3, 6, 5, 4, 7, 8],
    colorToken: 'element-data-10'
  };

  lineMarkerSeries: MicrochartLineSeries = {
    values: [1, 3, 1, 9, 5, 10, 12],
    colorToken: 'element-data-1'
  };
  progressSeries1: MicrochartProgressSeries = { valuePercent: 40, colorToken: 'element-data-2' };
  progressSeries2: MicrochartProgressSeries = { valuePercent: 80, colorToken: 'element-data-12' };
}
