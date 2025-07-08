/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, OnDestroy, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiChartGaugeComponent } from '@siemens/charts-ng';
import { SiResizeObserverDirective } from '@siemens/element-ng/resize-observer';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-sample',
  templateUrl: './chart.html',
  imports: [FormsModule, SiChartGaugeComponent, SiResizeObserverDirective]
})
export class SampleComponent implements OnDestroy {
  chartData = {
    title: 'Gauge Chart',
    unit: ' km/h',
    minValue: 0,
    maxValue: 180,
    splitSteps: 12,
    colors: ['#28bf66', '#f3cb55', '#d92b48', '#9544ed'],
    segments: [0.2, 0.5, 0.7, 1],
    showLegend: true,
    liveUpdate: false,
    showDecimalDigit: true,
    height: 500
  };

  readonly chart = viewChild.required<SiChartGaugeComponent>('chart');
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
      this.chart().setValue(Math.random() * this.chart().maxValue());
    });
  }
}
