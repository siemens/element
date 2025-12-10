/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiChartCartesianComponent } from '@siemens/charts-ng';
import { SiResizeObserverDirective } from '@siemens/element-ng/resize-observer';

@Component({
  selector: 'app-sample',
  imports: [SiChartCartesianComponent, SiResizeObserverDirective],
  templateUrl: './si-chart-line.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {}
