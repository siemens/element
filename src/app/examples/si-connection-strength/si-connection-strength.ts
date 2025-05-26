/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiConnectionStrengthComponent } from '@siemens/element-ng/connection-strength';

@Component({
  selector: 'app-sample',
  templateUrl: './si-connection-strength.html',
  host: { class: 'p-5' },
  imports: [SiConnectionStrengthComponent]
})
export class SampleComponent {}
