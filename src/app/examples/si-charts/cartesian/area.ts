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
    title: 'Smooth Area Chart',
    xAxis: { type: 'category' } as ChartXAxis,
    yAxis: { type: 'value' } as ChartYAxis,
    series: [
      {
        type: 'line',
        name: 'Series 1',
        smooth: true,
        area: true,
        data: [
          ['2000-06-05', 116],
          ['2000-06-06', 129],
          ['2000-06-07', 135],
          ['2000-06-08', 86],
          ['2000-06-09', 73],
          ['2000-06-10', 85],
          ['2000-06-11', 73],
          ['2000-06-12', 68],
          ['2000-06-13', 92],
          ['2000-06-14', 130],
          ['2000-06-15', 245],
          ['2000-06-16', 139],
          ['2000-06-17', 115],
          ['2000-06-18', 111],
          ['2000-06-19', 309],
          ['2000-06-20', 206],
          ['2000-06-21', 137],
          ['2000-06-22', 128],
          ['2000-06-23', 85],
          ['2000-06-24', 94],
          ['2000-06-25', 71],
          ['2000-06-26', 106],
          ['2000-06-27', 84],
          ['2000-06-28', 93],
          ['2000-06-29', 85],
          ['2000-06-30', 73],
          ['2000-07-01', 83],
          ['2000-07-02', 125],
          ['2000-07-03', 107],
          ['2000-07-04', 82]
        ]
      }
    ] as CartesianChartSeries[],
    showLegend: true,
    zoomSlider: true,
    zoomInside: true
  };
}
