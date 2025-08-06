/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiIconNextComponent } from '@siemens/element-ng/icon';
import { MicroBarSeries, SiMicroBarComponent } from '@siemens/native-charts-ng/micro-bar';
import { MicroDonutSeries, SiMicroDonutComponent } from '@siemens/native-charts-ng/micro-donut';
import { MicroLineSeries, SiMicroLineComponent } from '@siemens/native-charts-ng/micro-line';
import {
  MicroProgressSeries,
  SiMicroProgressComponent
} from '@siemens/native-charts-ng/micro-progress';

@Component({
  selector: 'app-sample',
  imports: [
    SiMicroDonutComponent,
    SiMicroBarComponent,
    SiMicroLineComponent,
    SiMicroProgressComponent,
    SiIconNextComponent
  ],
  templateUrl: './si-micro-charts.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'p-5'
  }
})
export class SampleComponent {
  donutSeries: MicroDonutSeries[] = [{ valuePercent: 40, colorToken: 'element-data-4' }];
  barSeries: MicroBarSeries = {
    values: [2, 4, 5, 3, 5, 7, 7, 9, 11, 10, 12, 9],
    colorToken: 'element-data-7'
  };
  lineSeries: MicroLineSeries = { values: [2, 3, 6, 5, 4, 7, 8], colorToken: 'element-data-10' };
  progressSeries: MicroProgressSeries = { valuePercent: 80, colorToken: 'element-data-2' };
}
