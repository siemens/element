/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiStatusIconComponent } from '@siemens/element-ng/icon';

@Component({
  selector: 'app-sample',
  imports: [SiStatusIconComponent],
  templateUrl: './si-status-icon.html',
  host: { class: 'p-5' }
})
export class SampleComponent {}
