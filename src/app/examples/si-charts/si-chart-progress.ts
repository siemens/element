/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiChartProgressComponent, themeElement, themeSupport } from '@siemens/charts-ng';
import { SiResizeObserverDirective } from '@siemens/element-ng/resize-observer';

themeSupport.setDefault(themeElement);

@Component({
  selector: 'app-sample',
  templateUrl: './si-chart-progress.html',
  host: { class: 'p-5' },
  imports: [SiChartProgressComponent, SiResizeObserverDirective]
})
export class SampleComponent {}
