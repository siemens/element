/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
/* eslint-disable @typescript-eslint/no-deprecated */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiNavbarModule } from '@siemens/element-ng/navbar';

@Component({
  selector: 'app-sample',
  templateUrl: './si-navbar-primary-end.html',
  changeDetection: ChangeDetectionStrategy.OnPush,

  imports: [SiNavbarModule]
})
export class SampleComponent {}
