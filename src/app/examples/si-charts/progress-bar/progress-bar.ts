/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, OnDestroy, viewChild } from '@angular/core';
import { ProgressChartSeries, SiChartProgressBarComponent } from '@siemens/charts-ng';
import { SiResizeObserverDirective } from '@siemens/element-ng/resize-observer';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-sample',
  templateUrl: './chart.html',
  imports: [SiChartProgressBarComponent, SiResizeObserverDirective]
})
export class SampleComponent implements OnDestroy {
  chartData = {
    title: 'Progress Bar Chart',
    subTitle: undefined,
    labelPosition: '',
    series: [
      {
        name: 'Value 1',
        percent: 80
      },
      {
        name: 'Value 2',
        percent: 25
      },
      {
        name: 'Value 3',
        percent: 75
      },
      {
        name: 'Value 4',
        percent: 60
      },
      {
        name: 'Value 5',
        percent: 100
      }
    ] as ProgressChartSeries[],
    showLegend: true,
    liveUpdate: false
  };

  readonly chart = viewChild.required<SiChartProgressBarComponent>('chart');
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
