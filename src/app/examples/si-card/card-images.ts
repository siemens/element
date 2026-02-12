/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-sample',
  templateUrl: './card-images.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {}
