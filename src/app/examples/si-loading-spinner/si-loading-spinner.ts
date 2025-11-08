/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SiLoadingSpinnerComponent } from '@siemens/element-ng/loading-spinner';

@Component({
  selector: 'app-sample',
  imports: [SiLoadingSpinnerComponent],
  templateUrl: './si-loading-spinner.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  loading = true;
}
