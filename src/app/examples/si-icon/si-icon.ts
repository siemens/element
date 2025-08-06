/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiIconComponent } from '@spike-rabbit/element-ng/icon';

@Component({
  selector: 'app-sample',
  imports: [SiIconComponent],
  templateUrl: './si-icon.html',
  host: { class: 'p-5' }
})
export class SampleComponent {}
