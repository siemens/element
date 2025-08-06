/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  MicroProgressSeries,
  SiMicroProgressComponent
} from '@siemens/native-charts-ng/micro-progress';

@Component({
  selector: 'app-sample',
  imports: [SiMicroProgressComponent],
  templateUrl: './si-micro-progress.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'p-5'
  }
})
export class SampleComponent {
  series: MicroProgressSeries = { valuePercent: 80, colorToken: 'element-data-7' };
}
