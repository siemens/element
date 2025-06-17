/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiUnauthorizedPageModule } from '@siemens/element-ng/unauthorized-page';

@Component({
  selector: 'app-sample',
  templateUrl: './si-unauthorized-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiUnauthorizedPageModule]
})
export class SampleComponent {}
