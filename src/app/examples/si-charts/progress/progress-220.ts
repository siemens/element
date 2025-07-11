/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, OnDestroy, viewChild } from '@angular/core';
import { ProgressChartSeries, SiChartProgressComponent } from '@siemens/charts-ng';
import { SiResizeObserverDirective } from '@siemens/element-ng/resize-observer';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-sample',
  imports: [SiChartProgressComponent, SiResizeObserverDirective],
  templateUrl: './chart.html'
})
export class SampleComponent implements OnDestroy {
  chartData = {
    title: 'Progress Chart with 220° Circles',
    subTitle: 'Single Value Update',
    series: [
      {
        name: 'Value 1',
        percent: 10
      },
      {
        name: 'Value 2',
        percent: 20
      },
      {
        name: 'Value 3',
        percent: 30
      },
      {
        name: 'Value 4',
        percent: 40
      },
      {
        name: 'Value 5',
        percent: 70
      }
    ] as ProgressChartSeries[],
    showLegend: true,
    dataAngle: 220,
    liveUpdate: false
  };

  readonly chart = viewChild.required<SiChartProgressComponent>('chart');
  private liveSubscription?: Subscription;

  ngOnDestroy(): void {
    this.liveSubscription?.unsubscribe();
  }

  stopLive(): void {
    this.chartData.liveUpdate = false;
    this.liveSubscription?.unsubscribe();
  }

  startLive(): void {
    this.chartData.liveUpdate = true;
    this.liveSubscription = interval(1000).subscribe(() => {
      this.chart().changeSingleValue(0, Math.random() * 100);
    });
  }
}
