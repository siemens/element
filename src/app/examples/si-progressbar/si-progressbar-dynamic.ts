/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiProgressbarComponent } from '@siemens/element-ng/progressbar';

@Component({
  selector: 'app-sample',
  templateUrl: './si-progressbar-dynamic.html',
  host: { class: 'p-5' },
  imports: [SiProgressbarComponent]
})
export class SampleComponent {
  maxProgress = 200;
  dynamic = 42;

  random(): void {
    this.dynamic = Math.floor(Math.random() * 100 + 1);
  }
}
