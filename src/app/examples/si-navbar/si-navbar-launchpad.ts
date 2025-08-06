/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiNavbarModule } from '@spike-rabbit/element-ng/navbar';

@Component({
  selector: 'app-sample',
  imports: [SiNavbarModule],
  templateUrl: './si-navbar-launchpad.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {}
