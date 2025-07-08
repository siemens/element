/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, OnDestroy, viewChild } from '@angular/core';
import {
  CartesianChartSeries,
  ChartXAxis,
  ChartYAxis,
  SiChartCartesianComponent
} from '@siemens/charts-ng';
import { SiResizeObserverDirective } from '@siemens/element-ng/resize-observer';
import { interval, Subscription } from 'rxjs';

import { ChartBase, ChartData } from './chart-base';

@Component({
  selector: 'app-sample',
  templateUrl: './chart.html',
  imports: [SiChartCartesianComponent, SiResizeObserverDirective]
})
export class SampleComponent extends ChartBase implements OnDestroy {
  chartData: ChartData = {
    title: 'Live Scatter Chart',
    xAxis: { type: 'time' } as ChartXAxis,
    yAxis: { type: 'value' } as ChartYAxis,
    stacked: false,
    series: [
      {
        name: 'Series 1',
        type: 'scatter',
        data: [
          [new Date(2019, 0, 1, 0, 0, 0), 2],
          [new Date(2019, 1, 1, 0, 0, 0), 2],
          [new Date(2019, 2, 1, 0, 0, 0), 3],
          [new Date(2019, 3, 1, 0, 0, 0), 5],
          [new Date(2019, 4, 1, 0, 0, 0), 6]
        ]
      },
      {
        name: 'Series 2',
        type: 'scatter',
        data: [
          [new Date(2019, 0, 1, 0, 0, 0), 1],
          [new Date(2019, 1, 1, 0, 0, 0), 3],
          [new Date(2019, 2, 1, 0, 0, 0), 2],
          [new Date(2019, 3, 1, 0, 0, 0), 4],
          [new Date(2019, 4, 1, 0, 0, 0), 10]
        ]
      }
    ] as CartesianChartSeries[],
    showLegend: true,
    zoomSlider: true,
    autoZoomSeriesIndex: 1,
    maxEntries: 1500,
    visibleEntries: 10,
    liveUpdate: false
  };

  readonly chart = viewChild.required<SiChartCartesianComponent>('chart');
  private liveSubscription?: Subscription;
  private year = 2019;
  private month = 5;

  ngOnDestroy(): void {
    this.liveSubscription?.unsubscribe();
  }

  override stopLive(): void {
    this.chartData.liveUpdate = false;
    this.liveSubscription?.unsubscribe();
  }

  override startLive(): void {
    this.chartData.liveUpdate = true;
    this.liveSubscription = interval(1000).subscribe(() => {
      this.month++;
      if (this.month >= 12) {
        this.year++;
        this.month = 0;
      }

      const newData1 = [
        new Date(this.year, this.month, 1, 0, 0, 0),
        Math.round(Math.random() * 15)
      ];
      const newData2 = [
        new Date(this.year, this.month, 1, 0, 0, 0),
        Math.round(Math.random() * 7.5) - 3
      ];

      this.chart().addDataMulti([
        { index: 0, data: newData1 },
        { index: 1, data: newData2 }
      ]);
    });
  }
}
