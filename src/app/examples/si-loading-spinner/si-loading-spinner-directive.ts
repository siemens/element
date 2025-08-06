/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiCardComponent } from '@spike-rabbit/element-ng/card';
import { SiLoadingSpinnerDirective } from '@spike-rabbit/element-ng/loading-spinner';

@Component({
  selector: 'app-sample',
  imports: [SiCardComponent, SiLoadingSpinnerDirective],
  templateUrl: './si-loading-spinner-directive.html'
})
export class SampleComponent {
  loading = false;
}
