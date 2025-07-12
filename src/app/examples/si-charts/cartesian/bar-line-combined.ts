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
  imports: [SiChartCartesianComponent, SiResizeObserverDirective],
  templateUrl: './chart.html'
})
export class SampleComponent extends ChartBase {
  chartData: ChartData = {
    title: 'Bar and Line Chart combined',
    xAxis: { type: 'category' } as ChartXAxis,
    yAxis: { type: 'value' } as ChartYAxis,
    series: [
      {
        type: 'bar',
        name: 'Series 1',
        data: [
          ['Value 1', 8],
          ['Value 2', 10],
          ['Value 3', 1],
          ['Value 4', 7],
          ['Value 5', 2],
          ['Value 6', 5],
          ['Value 7', 10],
          ['Value 8', 8],
          ['Value 9', 6]
        ]
      },
      {
        type: 'bar',
        name: 'Series 2',
        data: [
          ['Value 1', 3],
          ['Value 2', 10],
          ['Value 3', 8],
          ['Value 4', 11],
          ['Value 5', 5],
          ['Value 6', 4],
          ['Value 7', 8],
          ['Value 8', 5],
          ['Value 9', 6]
        ]
      },
      {
        type: 'line',
        name: 'Series 3',
        smooth: true,
        data: [
          ['Value 1', 5],
          ['Value 2', 7],
          ['Value 3', 5],
          ['Value 4', 4],
          ['Value 5', 6],
          ['Value 6', 1],
          ['Value 7', 9],
          ['Value 8', 4],
          ['Value 9', 4]
        ]
      },
      {
        type: 'line',
        name: 'Series 4',
        smooth: true,
        data: [
          ['Value 1', 10],
          ['Value 2', 2],
          ['Value 3', 8],
          ['Value 4', 9],
          ['Value 5', 7],
          ['Value 6', 6],
          ['Value 7', 12],
          ['Value 8', 11],
          ['Value 9', 8]
        ]
      }
    ] as CartesianChartSeries[],
    showLegend: true,
    zoomSlider: true
  };
}
