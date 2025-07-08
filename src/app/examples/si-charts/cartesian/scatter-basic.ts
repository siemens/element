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
    title: 'Scatter Chart',
    xAxis: { type: 'category' } as ChartXAxis,
    yAxis: { type: 'value' } as ChartYAxis,
    series: [
      {
        name: 'Series 1',
        type: 'scatter',
        // Supported symbols are `circle`, `triangle`, `rect`, `roundRect`, `diamond` and `pin`.
        // Specifying any other symbol or even not specifying the symbol, will fallback to `circle`.
        symbol: 'triangle',
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
        name: 'Series 2',
        type: 'scatter',
        // Supported symbols are `circle`, `triangle`, `rect`, `roundRect`, `diamond` and `pin`.
        // Specifying any other symbol or even not specifying the symbol, will fallback to `circle`.
        symbol: 'diamond',
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
        name: 'Series 3',
        type: 'scatter',
        data: [
          ['Value 1', 7],
          ['Value 2', 6],
          ['Value 3', 12],
          ['Value 4', 15],
          ['Value 5', 8],
          ['Value 6', 2],
          ['Value 7', 9],
          ['Value 8', 16],
          ['Value 9', 1]
        ]
      }
    ] as CartesianChartSeries[],
    showLegend: true
  };
}
