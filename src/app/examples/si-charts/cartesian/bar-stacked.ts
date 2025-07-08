/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import {
  CartesianChartSeries,
  ChartXAxis,
  ChartYAxis,
  SiChartCartesianComponent
} from '@siemens/charts-ng';
import { SiResizeObserverDirective } from '@siemens/element-ng/resize-observer';

import { ChartBase, ChartData } from './chart-base';

@Component({
  selector: 'app-sample',
  templateUrl: './chart.html',
  imports: [SiChartCartesianComponent, SiResizeObserverDirective]
})
export class SampleComponent extends ChartBase {
  chartData: ChartData = {
    title: 'Stacked Bar Chart',
    xAxis: {
      type: 'category',
      data: [1, 2, 3, 4, 5, 6, 7, 8, 9]
    } as ChartXAxis,
    yAxis: { type: 'value' } as ChartYAxis,
    series: [
      {
        type: 'bar',
        name: 'Series 1',
        stack: 'stack-1',
        data: [8, 10, 1, 7, 2, 5, 10, 8, 6]
      },
      {
        type: 'bar',
        name: 'Series 2',
        stack: 'stack-1',
        data: [3, 10, 8, 11, 5, 4, 8, 5, 6]
      },
      {
        type: 'bar',
        name: 'Series 3',
        stack: 'stack-1',
        data: [5, 7, 5, 4, 6, 1, 9, 4, 4]
      }
    ] as CartesianChartSeries[],
    showLegend: true,
    zoomSlider: false
  };
}
