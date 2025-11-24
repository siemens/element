/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiChartProgressBarComponent } from '@siemens/charts-ng/progress-bar';
import { SiResizeObserverDirective } from '@siemens/element-ng/resize-observer';

@Component({
  selector: 'app-sample',
  imports: [SiChartProgressBarComponent, SiResizeObserverDirective],
  templateUrl: './si-chart-progress-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {}
