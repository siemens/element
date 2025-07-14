/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiProgressbarComponent } from '@siemens/element-ng/progressbar';

@Component({
  selector: 'app-sample',
  imports: [SiProgressbarComponent],
  templateUrl: './si-progressbar-dynamic.html',
  host: { class: 'p-5' }
})
export class SampleComponent {
  maxProgress = 200;
  dynamic = 42;

  random(): void {
    this.dynamic = Math.floor(Math.random() * 100 + 1);
  }
}
