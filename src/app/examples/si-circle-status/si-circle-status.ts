/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiCircleStatusComponent } from '@spike-rabbit/element-ng/circle-status';

@Component({
  selector: 'app-sample',
  imports: [SiCircleStatusComponent, FormsModule],
  templateUrl: './si-circle-status.html'
})
export class SampleComponent {
  pulsing = false;
}
