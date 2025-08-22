/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiStatusCounterComponent } from '@siemens/element-ng/status-counter';

@Component({
  selector: 'app-sample',
  imports: [SiStatusCounterComponent],
  templateUrl: './si-status-counter.html',
  host: { class: 'p-5' }
})
export class SampleComponent {}
