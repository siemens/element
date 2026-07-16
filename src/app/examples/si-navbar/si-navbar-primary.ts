/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
/* eslint-disable @typescript-eslint/no-deprecated */
import { Component } from '@angular/core';
import { SiNavbarModule } from '@siemens/element-ng/navbar';

@Component({
  selector: 'app-sample',
  imports: [SiNavbarModule],
  templateUrl: './si-navbar-primary.html'
})
export class SampleComponent {}
