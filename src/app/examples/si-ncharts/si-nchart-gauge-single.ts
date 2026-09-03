/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiFormItemComponent } from '@siemens/element-ng/form';
import { SiNumberInputComponent } from '@siemens/element-ng/number-input';
import { LOG_EVENT } from '@siemens/live-preview';
import { GaugeSegment, GaugeSeries, SiNChartGaugeComponent } from '@siemens/native-charts-ng/gauge';

@Component({
  selector: 'app-sample',
  imports: [FormsModule, SiFormItemComponent, SiNumberInputComponent, SiNChartGaugeComponent],
  templateUrl: './si-nchart-gauge-single.html',
  host: {
    class: 'p-5'
  }
})
export class SampleComponent {
  readonly logEvent = inject(LOG_EVENT);
  readonly segments: GaugeSegment[] = [
    { colorToken: 'si-sys-data-rating-excellent', endValue: 400 },
    { colorToken: 'si-sys-data-rating-good', endValue: 600 },
    { colorToken: 'si-sys-data-rating-average', endValue: 900 },
    { colorToken: 'si-sys-data-rating-bad', endValue: 1200 },
    { colorToken: 'si-sys-background-critical', endValue: 1500 }
  ];
  showTicks = true;
  minDecimals = 0;
  maxDecimals = 2;
  axisDecimals = 0;
  showRangeLabelsOutside = false;
  showSegments = true;

  series: GaugeSeries[] = [
    { name: 'Series 1', value: 350, colorToken: 'si-sys-data-categorical-5' }
  ];

  setValues(val1: number): void {
    this.series[0].value = val1;
    this.series = this.series.slice();
  }
}
