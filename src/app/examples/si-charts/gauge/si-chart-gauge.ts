/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiChartGaugeComponent } from '@siemens/charts-ng/gauge';
import { SiResizeObserverDirective } from '@siemens/element-ng/resize-observer';

@Component({
  selector: 'app-sample',
  imports: [SiChartGaugeComponent, SiResizeObserverDirective],
  templateUrl: './si-chart-gauge.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  additionalOptions = {
    tooltip: { formatter: '{c} kWh' }
  };
}
