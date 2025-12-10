/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-sample',
  template: `
    <h1 class="si-display-xl">Display Extra Large</h1>
    <h1 class="si-display-lg">Display Large</h1>
    <h1 class="si-display-bold">Display Bold</h1>
    <h1 class="si-display">Display</h1>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {}
