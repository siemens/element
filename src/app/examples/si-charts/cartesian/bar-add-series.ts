/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, viewChild } from '@angular/core';
import {
  CartesianChartSeries,
  ChartXAxis,
  ChartYAxis,
  SiChartCartesianComponent
} from '@spike-rabbit/charts-ng';
import { SiResizeObserverDirective } from '@spike-rabbit/element-ng/resize-observer';

import { ChartBase, ChartData } from './chart-base';

const point = (): number => Math.round(Math.random() * 100);

@Component({
  selector: 'app-sample',
  imports: [SiChartCartesianComponent, SiResizeObserverDirective],
  templateUrl: './chart.html'
})
export class SampleComponent extends ChartBase {
  chartData: ChartData = {
    addSeries: true,
    title: 'Bar Chart',
    tooltip: null,
    xAxis: { type: 'time' } as ChartXAxis, // either 'category' or 'time'
    yAxis: { type: 'value' } as ChartYAxis,
    series: [] as CartesianChartSeries[],
    showLegend: true,
    zoomSlider: true
  };

  readonly chart = viewChild.required<SiChartCartesianComponent>('chart');

  override addSeries(): void {
    const data = [
      ['2022-01-02', point()],
      ['2022-01-03', point()],
      ['2022-01-04', point()]
    ];

    this.chartData.series.push({
      type: 'bar',
      name: 'Series ' + (this.chartData.series.length + 1),
      data
    });

    // because Angular change detection cannot detect the push
    this.chartData.series = this.chartData.series.slice();
  }

  override changeData(): void {
    this.chartData.series.forEach(s => {
      if (Array.isArray(s.data)) {
        s.data.forEach(d => ((d as any[])[1] = point()));
      }
    });
    // need to tell the charts the the series data has changed
    this.chart().refreshSeries();
  }
}
