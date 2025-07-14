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
    title: 'Stacked Area Chart',
    xAxis: { type: 'category' } as ChartXAxis,
    yAxis: { type: 'value' } as ChartYAxis,
    tooltip: {
      formatter: 'test'
    },
    series: [
      {
        type: 'line',
        name: 'Series 1',
        stack: 'stack-1',
        symbol: 'triangle',
        area: true,
        data: [
          ['2000-06-05', 20],
          ['2000-06-06', 27],
          ['2000-06-07', 25],
          ['2000-06-08', 20],
          ['2000-06-09', 15],
          ['2000-06-10', 10],
          ['2000-06-11', 15],
          ['2000-06-12', 16],
          ['2000-06-13', 17],
          ['2000-06-14', 14],
          ['2000-06-15', 13],
          ['2000-06-16', 10]
        ]
      },
      {
        type: 'line',
        name: 'Series 2',
        stack: 'stack-1',
        area: true,
        data: [
          ['2000-06-05', 16],
          ['2000-06-06', 18],
          ['2000-06-07', 20],
          ['2000-06-08', 25],
          ['2000-06-09', 23],
          ['2000-06-10', 21],
          ['2000-06-11', 17],
          ['2000-06-12', 15],
          ['2000-06-13', 13],
          ['2000-06-14', 11],
          ['2000-06-15', 9],
          ['2000-06-16', 9]
        ]
      }
    ] as CartesianChartSeries[],
    showLegend: true,
    zoomSlider: false,
    zoomInside: true
  };
}
