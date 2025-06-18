/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiTabComponent, SiTabsetComponent } from '@siemens/element-ng/tabs';

@Component({
  selector: 'app-sample',
  templateUrl: './si-tabs-flex.html',
  host: { class: 'p-5' },
  imports: [SiTabComponent, SiTabsetComponent]
})
export class SampleComponent {}
