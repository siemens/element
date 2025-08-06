/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiFormItemComponent } from '@spike-rabbit/element-ng/form';
import { SiNumberInputComponent } from '@spike-rabbit/element-ng/number-input';
import { LOG_EVENT } from '@spike-rabbit/live-preview';
import { GaugeSeries, SiNChartGaugeComponent } from '@spike-rabbit/native-charts-ng';

@Component({
  selector: 'app-sample',
  imports: [FormsModule, SiFormItemComponent, SiNumberInputComponent, SiNChartGaugeComponent],
  templateUrl: './si-nchart-gauge.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'p-5'
  }
})
export class SampleComponent {
  readonly logEvent = inject(LOG_EVENT);
  angle = 90;
  range = 200;
  unit = 'KWh';
  showTicks = true;
  minDecimals = 0;
  maxDecimals = 2;
  axisDecimals = 0;
  showLegend = true;
  legendPosition: 'column' | 'row' = 'row';
  showRangeLabelsOutside = false;

  series: GaugeSeries[] = [
    { name: 'Series 1', value: 50.456, colorToken: 'element-data-5' },
    {
      name: 'Series 2',
      value: 100.123,
      colorToken: 'element-data-15',
      description: 'Optional description'
    }
  ];

  setValues(val1: number, val2: number): void {
    this.series[0].value = val1;
    this.series[1].value = val2;
    this.series = this.series.slice();
  }
}
