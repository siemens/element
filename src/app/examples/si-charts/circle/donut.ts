/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { CircleChartSeries, SiChartCircleComponent } from '@spike-rabbit/charts-ng';
import { SiResizeObserverDirective } from '@spike-rabbit/element-ng/resize-observer';

@Component({
  selector: 'app-sample',
  imports: [SiChartCircleComponent, SiResizeObserverDirective],
  templateUrl: './chart.html'
})
export class SampleComponent {
  chartData = {
    title: 'Circle Chart as Donut',
    subTitle: undefined,
    series: [
      {
        name: 'Series 1',
        radius: ['50%', '75%'],
        data: [
          { value: 10, name: 'Value 1' },
          { value: 55, name: 'Value 2' },
          { value: 10, name: 'Value 3' },
          { value: 25, name: 'Value 4' }
        ]
      }
    ] as CircleChartSeries[],
    showLegend: true,
    liveUpdate: undefined
  };

  startLive(): void {}
  stopLive(): void {}
}
