/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SiConnectionStrengthComponent } from '@siemens/element-ng/connection-strength';

@Component({
  selector: 'app-sample',
  imports: [SiConnectionStrengthComponent],
  templateUrl: './si-connection-strength.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {}
