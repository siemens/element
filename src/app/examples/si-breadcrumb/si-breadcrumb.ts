/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiBreadcrumbModule } from '@siemens/element-ng/breadcrumb';

@Component({
  selector: 'app-sample',
  imports: [SiBreadcrumbModule],
  templateUrl: './si-breadcrumb.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {}
