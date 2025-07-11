/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiCardComponent } from '@siemens/element-ng/card';
import { SiLoadingSpinnerDirective } from '@siemens/element-ng/loading-spinner';

@Component({
  selector: 'app-sample',
  imports: [SiCardComponent, SiLoadingSpinnerDirective],
  templateUrl: './si-loading-spinner-directive.html'
})
export class SampleComponent {
  loading = false;
}
