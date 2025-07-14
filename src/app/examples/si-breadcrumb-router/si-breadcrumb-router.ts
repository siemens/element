/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { SiBreadcrumbRouterComponent } from '@siemens/element-ng/breadcrumb-router';

@Component({
  selector: 'app-sample',
  imports: [SiBreadcrumbRouterComponent],
  templateUrl: './si-breadcrumb-router.html',
  host: { class: 'p-5' }
})
export class SampleComponent {}
