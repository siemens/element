/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiCardComponent } from '@siemens/element-ng/card';

@Component({
  selector: 'app-sample',
  imports: [SiCardComponent],
  templateUrl: './si-card-accent.html',
  styles: `
    .card-size {
      height: 200px;
    }
  `
})
export class SampleComponent {}
