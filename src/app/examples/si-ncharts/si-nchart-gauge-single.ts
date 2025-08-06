/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiFormItemComponent } from '@spike-rabbit/element-ng/form';
import { SiNumberInputComponent } from '@spike-rabbit/element-ng/number-input';
import { LOG_EVENT } from '@spike-rabbit/live-preview';
import { GaugeSegment, GaugeSeries, SiNChartGaugeComponent } from '@spike-rabbit/native-charts-ng';

@Component({
  selector: 'app-sample',
  imports: [FormsModule, SiFormItemComponent, SiNumberInputComponent, SiNChartGaugeComponent],
  templateUrl: './si-nchart-gauge-single.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'p-5'
  }
})
export class SampleComponent {
  readonly logEvent = inject(LOG_EVENT);
  readonly segments: GaugeSegment[] = [
    { colorToken: 'element-color-bad', endValue: 20 },
    { colorToken: 'element-color-average', endValue: 70 },
    { colorToken: 'element-color-excellent', endValue: 100 }
  ];
  showTicks = true;
  minDecimals = 0;
  maxDecimals = 2;
  axisDecimals = 0;
  showRangeLabelsOutside = false;
  showSegments = true;

  series: GaugeSeries[] = [{ name: 'Series 1', value: 50.456, colorToken: 'element-data-5' }];

  setValues(val1: number): void {
    this.series[0].value = val1;
    this.series = this.series.slice();
  }
}
