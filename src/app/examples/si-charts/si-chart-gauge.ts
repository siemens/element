/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiChartGaugeComponent, themeElement, themeSupport } from '@siemens/charts-ng';
import { SiResizeObserverDirective } from '@siemens/element-ng/resize-observer';

themeSupport.setDefault(themeElement);

@Component({
  selector: 'app-sample',
  imports: [SiChartGaugeComponent, SiResizeObserverDirective],
  templateUrl: './si-chart-gauge.html',
  host: { class: 'p-5' }
})
export class SampleComponent {
  additionalOptions = {
    tooltip: { formatter: '{c} kWh' }
  };
}
