/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiNavbarModule } from '@siemens/element-ng/navbar';

@Component({
  selector: 'app-sample',
  imports: [SiNavbarModule], // eslint-disable-line @typescript-eslint/no-deprecated
  templateUrl: './si-navbar-launchpad.html'
})
export class SampleComponent {}
