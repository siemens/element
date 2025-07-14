/**
 * Copyright (c) Siemens 2016 - 2025
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
  imports: [SiChartCartesianComponent, SiResizeObserverDirective],
  templateUrl: './chart.html'
})
export class SampleComponent extends ChartBase implements OnDestroy {
  chartData: ChartData = {
    title: 'Line Chart',
    xAxis: { type: 'time' } as ChartXAxis,
    yAxis: { type: 'value' } as ChartYAxis,
    stacked: false,
    series: [
      {
        type: 'line',
        name: 'Series 1',
        data: [
          [new Date(2018, 1, 1, 0, 0, 0), 8],
          [new Date(2018, 2, 1, 0, 0, 0), 10],
          [new Date(2018, 3, 1, 0, 0, 0), -1],
          [new Date(2018, 4, 1, 0, 0, 0), 0],
          [new Date(2018, 5, 1, 0, 0, 0), -3]
        ]
      },
      {
        type: 'line',
        name: 'Series 2',
        data: [
          [new Date(2018, 1, 1, 0, 0, 0), 3],
          [new Date(2018, 2, 1, 0, 0, 0), 10],
          [new Date(2018, 3, 1, 0, 0, 0), 8],
          [new Date(2018, 4, 1, 0, 0, 0), 11]
        ]
      }
    ] as CartesianChartSeries[],
    showLegend: true,
    zoomSlider: true,
    autoZoomSeriesIndex: 1,
    maxEntries: 1500,
    liveUpdate: false,
    progressIndication: false
  };

  readonly chart = viewChild.required<SiChartCartesianComponent>('chart');
  private liveSubscription?: Subscription;
  private year = 2018;
  private month = 6;

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

  override startProgressIndication(): void {
    this.chartData.progressIndication = true;
    this.chart().startProgressIndication();
  }

  override stopProgressIndication(): void {
    this.chartData.progressIndication = false;
    this.chart().stopProgressIndication();
  }
}
