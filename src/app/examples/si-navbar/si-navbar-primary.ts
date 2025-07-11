/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
/* eslint-disable @typescript-eslint/no-deprecated */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiNavbarModule } from '@siemens/element-ng/navbar';

@Component({
  selector: 'app-sample',
  imports: [SiNavbarModule],
  templateUrl: './si-navbar-primary.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {}
