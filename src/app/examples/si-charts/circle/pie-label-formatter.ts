/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, OnDestroy, viewChild } from '@angular/core';
import { CircleChartSeries, SiChartCircleComponent } from '@spike-rabbit/charts-ng';
import { SiResizeObserverDirective } from '@spike-rabbit/element-ng/resize-observer';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-sample',
  imports: [SiChartCircleComponent, SiResizeObserverDirective],
  templateUrl: './chart.html'
})
export class SampleComponent implements OnDestroy {
  chartData = {
    title: 'Circle Chart as Pie',
    subTitle: 'Single Value Update',
    series: [
      {
        name: 'Series 1',
        data: [
          { value: 100, name: 'Value 1' },
          { value: 550, name: 'Value 2' },
          { value: 100, name: 'Value 3' },
          { value: 250, name: 'Value 4' }
        ],
        /**
         * A custom label formatter based on echarts, some commonly used variations can be
         * \{a\}: series name.
         * \{b\}: the name of a data item.
         * \{c\}: the value of a data item.
         * \{d\}: the percent.
         * See {@link https://echarts.apache.org/en/option.html#series-pie.label.formatter}
         */
        label: {
          formatter: '{c} kWh'
        }
      }
    ] as CircleChartSeries[],
    showLegend: true,
    liveUpdate: false
  };

  readonly chart = viewChild.required<SiChartCircleComponent>('chart');
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
      this.chart().changeSingleValue(0, 0, Math.random() * 100);
    });
  }
}
