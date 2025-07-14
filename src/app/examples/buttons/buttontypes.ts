/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';

@Component({
  selector: 'app-sample',
  templateUrl: './buttontypes.html',
  host: {
    class: 'bg-base-1'
  }
})
export class SampleComponent {
  disabled = false;
}
