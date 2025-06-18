/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiCardComponent } from '@siemens/element-ng/card';
import { SiLoadingSpinnerDirective } from '@siemens/element-ng/loading-spinner';

@Component({
  selector: 'app-sample',
  templateUrl: './si-loading-spinner-directive.html',
  imports: [SiCardComponent, SiLoadingSpinnerDirective]
})
export class SampleComponent {
  loading = false;
}
