/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { ProgressChartSeries, SiChartProgressComponent } from '@siemens/charts-ng';
import { SiResizeObserverDirective } from '@siemens/element-ng/resize-observer';

@Component({
  selector: 'app-sample',
  imports: [SiChartProgressComponent, SiResizeObserverDirective],
  templateUrl: './chart.html'
})
export class SampleComponent {
  chartData = {
    title: 'Progress Chart with 360° Circles',
    subTitle: 'Multi Values Update',
    series: [
      {
        name: 'Value 1',
        percent: 80
      },
      {
        name: 'Value 2',
        percent: 25
      },
      {
        name: 'Value 3',
        percent: 75
      }
    ] as ProgressChartSeries[],
    showLegend: true,
    dataAngle: 360,
    liveUpdate: undefined
  };

  startLive(): void {}
  stopLive(): void {}
}
