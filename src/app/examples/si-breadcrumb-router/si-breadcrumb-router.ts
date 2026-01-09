/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiBreadcrumbRouterComponent } from '@siemens/element-ng/breadcrumb-router';

@Component({
  selector: 'app-sample',
  imports: [SiBreadcrumbRouterComponent],
  templateUrl: './si-breadcrumb-router.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {}
