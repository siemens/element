/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-sample',
  templateUrl: './type-styles.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {}
