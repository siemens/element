/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiIconStatusComponent } from '@spike-rabbit/element-ng/icon-status';

@Component({
  selector: 'app-sample',
  imports: [SiIconStatusComponent],
  templateUrl: './si-icon-status.html',
  host: { class: 'p-5' }
})
export class SampleComponent {}
