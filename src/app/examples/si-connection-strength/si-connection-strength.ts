/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiConnectionStrengthComponent } from '@spike-rabbit/element-ng/connection-strength';

@Component({
  selector: 'app-sample',
  imports: [SiConnectionStrengthComponent],
  templateUrl: './si-connection-strength.html',
  host: { class: 'p-5' }
})
export class SampleComponent {}
