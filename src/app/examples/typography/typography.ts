/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-sample',
  templateUrl: './typography.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'px-9 pt-9 bg-base-1' }
})
export class SampleComponent {}
