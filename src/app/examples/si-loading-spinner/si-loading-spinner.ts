/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { SiLoadingSpinnerComponent } from '@siemens/element-ng/loading-spinner';

@Component({
  selector: 'app-sample',
  imports: [SiLoadingSpinnerComponent, FormField],
  templateUrl: './si-loading-spinner.html'
})
export class SampleComponent {
  loading = true;
  readonly withLoadingText = signal(false);
  readonly withLoadingTextField = form(this.withLoadingText);
}
