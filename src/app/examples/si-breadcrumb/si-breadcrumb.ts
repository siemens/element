/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiBreadcrumbModule } from '@siemens/element-ng/breadcrumb';

@Component({
  selector: 'app-sample',
  imports: [SiBreadcrumbModule],
  templateUrl: './si-breadcrumb.html',
  host: { class: 'p-5' }
})
export class SampleComponent {}
