/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-sample',
  templateUrl: './headings.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5 d-flex gap-8' }
})
export class SampleComponent {}
