/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiCircleStatusComponent } from '@siemens/element-ng/circle-status';

@Component({
  selector: 'app-sample',
  imports: [SiCircleStatusComponent, FormsModule],
  templateUrl: './si-circle-status.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  pulsing = false;
}
