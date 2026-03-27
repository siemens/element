/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiChartCartesianComponent } from '@siemens/charts-ng/cartesian';
import { ChartXAxis, ChartYAxis } from '@siemens/charts-ng/common';
import { SiResizeObserverDirective } from '@siemens/element-ng/resize-observer';

import { ChartBase, ChartData } from './chart-base';

@Component({
  selector: 'app-sample',
  imports: [SiChartCartesianComponent, SiResizeObserverDirective],
  templateUrl: './chart.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent extends ChartBase {
  chartData: ChartData = {
    title: 'Scatter chart with dataset',
    xAxis: { type: 'value' } as ChartXAxis,
    yAxis: { type: 'value' } as ChartYAxis,
    series: [
      {
        type: 'scatter',
        name: 'Series A'
      },
      {
        type: 'scatter',
        name: 'Series B',
        symbol: 'diamond',
        datasetIndex: 1
      }
    ],
    additionalOptions: {
      dataset: [
        {
          source: [
            [10, 20],
            [15, 35],
            [20, 25],
            [30, 40],
            [25, 15],
            [12, 28],
            [18, 32],
            [22, 18],
            [28, 42],
            [35, 30]
          ]
        },
        {
          source: [
            [8, 30],
            [14, 22],
            [19, 38],
            [24, 12],
            [32, 28],
            [11, 36],
            [16, 16],
            [27, 34],
            [33, 20],
            [38, 26]
          ]
        }
      ]
    },
    showLegend: true
  };
}
