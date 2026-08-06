/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { CartesianChartSeries, SiChartCartesianComponent } from '@siemens/charts-ng/cartesian';
import { ChartXAxis, ChartYAxis } from '@siemens/charts-ng/common';
import { SiResizeObserverDirective } from '@siemens/element-ng/resize-observer';

import { ChartBase, ChartData } from './chart-base';

@Component({
  selector: 'app-sample',
  imports: [SiChartCartesianComponent, SiResizeObserverDirective],
  templateUrl: './chart.html'
})
export class SampleComponent extends ChartBase {
  chartData: ChartData = {
    title: 'Line chart quadrant',
    xAxis: {
      type: 'value',
      min: -15,
      max: 15,
      name: 'X',
      axisLine: { show: true, onZero: true }
    } as ChartXAxis,
    yAxis: {
      type: 'value',
      min: -15,
      max: 15,
      name: 'Y',
      axisLine: { show: true, onZero: true }
    } as ChartYAxis,
    series: [
      {
        type: 'line',
        name: 'Path 1',
        symbol: 'circle',
        data: [
          [-8, -10],
          [-5, -4],
          [-2, 3],
          [2, 7],
          [7, 11]
        ]
      },
      {
        type: 'line',
        name: 'Path 2',
        symbol: 'diamond',
        data: [
          [-10, 8],
          [-5, 5],
          [0, 0],
          [5, -4],
          [10, -8]
        ]
      },
      {
        type: 'line',
        name: 'Path 3',
        symbol: 'triangle',
        data: [
          [-9, -7],
          [-4, -3],
          [1, 2],
          [6, 6],
          [10, 9]
        ]
      }
    ] as CartesianChartSeries[],
    showLegend: true
  };
}
