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
    title: 'Scatter and Line Chart combined',
    xAxis: { type: 'time' } as ChartXAxis,
    yAxis: { type: 'value' } as ChartYAxis,
    series: [
      {
        name: 'Series 1',
        type: 'scatter',
        data: [
          [new Date(2019, 4, 2, 6, 0, 0), 2],
          [new Date(2019, 4, 2, 7, 0, 0), 2],
          [new Date(2019, 4, 2, 8, 0, 0), 3],
          [new Date(2019, 4, 2, 9, 0, 0), 5],
          [new Date(2019, 4, 2, 10, 0, 0), 6],
          [new Date(2019, 4, 2, 11, 0, 0), 3],
          [new Date(2019, 4, 2, 12, 0, 0), 7],
          [new Date(2019, 4, 2, 13, 0, 0), 8],
          [new Date(2019, 4, 2, 14, 0, 0), 9],
          [new Date(2019, 4, 2, 15, 0, 0), 11],
          [new Date(2019, 4, 2, 16, 0, 0), 16],
          [new Date(2019, 4, 2, 17, 0, 0), 12],
          [new Date(2019, 4, 2, 18, 0, 0), 13],
          [new Date(2019, 4, 2, 19, 0, 0), 14],
          [new Date(2019, 4, 2, 20, 0, 0), 15]
        ]
      },
      {
        name: 'Series 2',
        type: 'scatter',
        data: [
          [new Date(2019, 4, 2, 6, 0, 0), 1],
          [new Date(2019, 4, 2, 7, 0, 0), 3],
          [new Date(2019, 4, 2, 8, 0, 0), 2],
          [new Date(2019, 4, 2, 9, 0, 0), 4],
          [new Date(2019, 4, 2, 10, 0, 0), 10],
          [new Date(2019, 4, 2, 11, 0, 0), 11],
          [new Date(2019, 4, 2, 12, 0, 0), 12],
          [new Date(2019, 4, 2, 13, 0, 0), 10],
          [new Date(2019, 4, 2, 14, 0, 0), 10],
          [new Date(2019, 4, 2, 15, 0, 0), 11],
          [new Date(2019, 4, 2, 16, 0, 0), 14],
          [new Date(2019, 4, 2, 17, 0, 0), 16],
          [new Date(2019, 4, 2, 18, 0, 0), 7],
          [new Date(2019, 4, 2, 19, 0, 0), 19],
          [new Date(2019, 4, 2, 20, 0, 0), 9]
        ]
      },
      {
        name: 'Series 3',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: [
          [new Date(2019, 4, 2, 6, 0, 0), 1.5],
          [new Date(2019, 4, 2, 7, 0, 0), 2],
          [new Date(2019, 4, 2, 8, 0, 0), 3],
          [new Date(2019, 4, 2, 9, 0, 0), 4],
          [new Date(2019, 4, 2, 10, 0, 0), 8],
          [new Date(2019, 4, 2, 11, 0, 0), 7],
          [new Date(2019, 4, 2, 12, 0, 0), 9.5],
          [new Date(2019, 4, 2, 13, 0, 0), 9],
          [new Date(2019, 4, 2, 14, 0, 0), 8.5],
          [new Date(2019, 4, 2, 15, 0, 0), 11],
          [new Date(2019, 4, 2, 16, 0, 0), 15],
          [new Date(2019, 4, 2, 17, 0, 0), 14],
          [new Date(2019, 4, 2, 18, 0, 0), 10],
          [new Date(2019, 4, 2, 19, 0, 0), 16.5],
          [new Date(2019, 4, 2, 20, 0, 0), 12]
        ]
      }
    ] as CartesianChartSeries[],
    showLegend: true,
    zoomSlider: true
  };
}
