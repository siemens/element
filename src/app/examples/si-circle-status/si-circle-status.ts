/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiCircleStatusComponent } from '@siemens/element-ng/circle-status';

@Component({
  selector: 'app-sample',
  templateUrl: './si-circle-status.html',
  imports: [SiCircleStatusComponent, FormsModule]
})
export class SampleComponent {
  pulsing = false;
}
