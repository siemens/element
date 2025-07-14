/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiUnauthorizedPageModule } from '@siemens/element-ng/unauthorized-page';

@Component({
  selector: 'app-sample',
  imports: [SiUnauthorizedPageModule],
  templateUrl: './si-unauthorized-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {}
