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
    title: 'Axis Position',
    xAxis: {
      type: 'category',
      position: 'top',
      splitLine: { show: false }
    } as ChartXAxis,
    yAxis: [
      {
        type: 'value',
        min: 0,
        max: 15,
        name: 'Y Axis Name'
      },
      {
        type: 'value',
        min: -5,
        max: 15,
        position: 'right'
      }
    ] as ChartYAxis[],
    series: [
      {
        type: 'line',
        name: 'Series 1',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: [
          ['Value 1', 8],
          ['Value 2', 10],
          ['Value 3', 5],
          ['Value 4', 6],
          ['Value 5', 11]
        ]
      },
      {
        type: 'line',
        name: 'Series 2',
        smooth: true,
        yAxisIndex: 1,
        color: '#4A88C6',
        lineStyle: {
          width: 4,
          type: 'dotted'
        },
        data: [
          ['Value 1', 3],
          ['Value 2', 10],
          ['Value 3', 8],
          ['Value 4', 2],
          ['Value 5', -3]
        ]
      }
    ] as CartesianChartSeries[],
    showLegend: true
  };
}
