/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { CartesianChartSeries, SiChartCartesianComponent } from '@siemens/charts-ng/cartesian';
import { ChartXAxis, ChartYAxis, EChartOption } from '@siemens/charts-ng/common';
import { SiResizeObserverDirective } from '@siemens/element-ng/resize-observer';

const data: [string, number][] = [
  ['00h', -2],
  ['03h', 1],
  ['06h', 6],
  ['09h', 14],
  ['12h', 22],
  ['15h', 25],
  ['18h', 18],
  ['21h', 9],
  ['24h', 3]
];

@Component({
  selector: 'app-sample',
  imports: [SiChartCartesianComponent, SiResizeObserverDirective],
  template: `
    <div class="card m-5 p-3">
      <si-chart-cartesian
        #chart
        class="bg-base-1"
        style="height: 400px"
        title="Temperature over time"
        [series]="series"
        [xAxis]="xAxis"
        [yAxis]="yAxis"
        [additionalOptions]="additionalOptions"
        [showLegend]="false"
        (siResizeObserver)="chart.resize()"
      />
    </div>
  `
})
export class SampleComponent {
  readonly xAxis: ChartXAxis = { type: 'category' } as ChartXAxis;
  readonly yAxis: ChartYAxis = { type: 'value', name: '°C' } as ChartYAxis;

  readonly series: CartesianChartSeries[] = [
    {
      type: 'bar',
      name: 'Temperature',
      data
    }
  ] as CartesianChartSeries[];

  readonly additionalOptions: EChartOption = {
    visualMap: {
      type: 'continuous',
      show: true,
      dimension: 1,
      calculable: true,
      right: 8,
      top: 'center',
      text: ['High', 'Low']
    }
  };
}
