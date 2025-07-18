/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';

@Component({
  selector: 'app-sample',
  templateUrl: './si-skeleton.html',
  host: { class: 'p-5' }
})
export class SampleComponent {
  loading = true;
}
