/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';

@Component({
  selector: 'app-sample',
  templateUrl: './radio.html',
  host: { class: 'p-5' }
})
export class SampleComponent {
  validation = false;
}
