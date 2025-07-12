/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, OnDestroy, viewChild } from '@angular/core';
import {
  CartesianChartData,
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
  imports: [SiChartCartesianComponent, SiResizeObserverDirective],
  templateUrl: './chart.html'
})
export class SampleComponent extends ChartBase implements OnDestroy {
  chartData: ChartData = {
    title: 'Candlestick Chart',
    xAxis: { type: 'time' } as ChartXAxis,
    yAxis: {
      type: 'value',
      min: -5,
      max: 55
    } as ChartYAxis,
    series: [
      {
        name: 'Testcandle',
        type: 'candlestick',
        data: [
          [new Date(2018, 1, 1, 0, 0, 0), 10, 20, 5, 18],
          [new Date(2018, 2, 1, 0, 0, 0), 5, 1, 0, 14],
          [new Date(2018, 3, 1, 0, 0, 0), 22, 4, 50, 40],
          [new Date(2018, 4, 1, 0, 0, 0), 1, 2, 3, 4]
        ]
      } as CartesianChartSeries
    ],
    showLegend: true,
    zoomSlider: true,
    visibleEntries: 10,
    liveUpdate: false
  };

  readonly chart = viewChild.required<SiChartCartesianComponent>('chart');
  private liveSubscription?: Subscription;
  private year = 2018;
  private month = 4;

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
      const newData: CartesianChartData = [
        new Date(this.year, this.month, 1, 0, 0, 0),
        Math.round(Math.random() * 50),
        Math.round(Math.random() * 50),
        Math.round(Math.random() * 25),
        Math.round(Math.random() * 25 + 25)
      ];

      this.chart().addData(0, newData);
    });
  }
}
