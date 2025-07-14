/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiLoadingSpinnerComponent } from '@siemens/element-ng/loading-spinner';

@Component({
  selector: 'app-sample',
  imports: [SiLoadingSpinnerComponent],
  templateUrl: './si-loading-spinner.html'
})
export class SampleComponent {
  loading = true;
}
