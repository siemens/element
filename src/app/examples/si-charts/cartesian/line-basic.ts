/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import {
  CartesianChartSeries,
  ChartXAxis,
  ChartYAxis,
  SiChartCartesianComponent
} from '@spike-rabbit/charts-ng';
import { SiResizeObserverDirective } from '@spike-rabbit/element-ng/resize-observer';

import { ChartBase, ChartData } from './chart-base';

@Component({
  selector: 'app-sample',
  imports: [SiChartCartesianComponent, SiResizeObserverDirective],
  templateUrl: './chart.html'
})
export class SampleComponent extends ChartBase {
  chartData: ChartData = {
    title: 'Basic Chart',
    xAxis: { type: 'category' } as ChartXAxis,
    yAxis: { type: 'value' } as ChartYAxis,
    stacked: false,
    series: [
      {
        type: 'line',
        name: 'Series 1',
        data: [
          ['Value 1', 8],
          ['Value 2', 10],
          ['Value 3', 0],
          ['Value 4', -3]
        ]
      },
      {
        type: 'line',
        name: 'Series 2',
        data: [
          ['Value 1', 3],
          ['Value 2', 10],
          ['Value 3', 8],
          ['Value 4', 11]
        ]
      },
      {
        type: 'line',
        name: 'Series 3',
        visible: false,
        data: [
          ['Value 1', 6],
          ['Value 2', 4],
          ['Value 3', 7],
          ['Value 4', 2]
        ]
      }
    ] as CartesianChartSeries[],
    showLegend: true
  };
}
