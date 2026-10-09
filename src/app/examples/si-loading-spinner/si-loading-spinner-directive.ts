/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { SiCardComponent } from '@siemens/element-ng/card';
import { SiLoadingSpinnerDirective } from '@siemens/element-ng/loading-spinner';

@Component({
  selector: 'app-sample',
  imports: [SiCardComponent, SiLoadingSpinnerDirective, FormField],
  templateUrl: './si-loading-spinner-directive.html'
})
export class SampleComponent {
  loading = false;
  readonly withLoadingText = signal(false);
  readonly withLoadingTextField = form(this.withLoadingText);
}
