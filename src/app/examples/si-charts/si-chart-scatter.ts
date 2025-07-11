/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import {
  CartesianChartSeries,
  SiChartCartesianComponent,
  themeElement,
  themeSupport
} from '@siemens/charts-ng';
import { SiResizeObserverDirective } from '@siemens/element-ng/resize-observer';

themeSupport.setDefault(themeElement);

@Component({
  selector: 'app-sample',
  imports: [SiChartCartesianComponent, SiResizeObserverDirective],
  templateUrl: './si-chart-scatter.html',
  host: { class: 'p-5' }
})
export class SampleComponent {
  chartData: CartesianChartSeries[] = [
    {
      type: 'scatter',
      name: 'GitLab',

      data: [
        ['2019-05-01', 800],
        ['2019-05-02', 810],
        ['2019-05-03', 920],
        ['2019-05-04', 500],
        ['2019-05-05', 756],
        ['2019-05-06', 1001]
      ]
    },
    {
      type: 'scatter',
      name: 'GitHub',
      symbol: 'diamond',
      symbolSize: 12,
      data: [
        ['2019-05-01', 600],
        ['2019-05-02', 730],
        ['2019-05-03', 780],
        ['2019-05-04', 200],
        ['2019-05-05', 489],
        ['2019-05-06', 808]
      ]
    }
  ];
}
