/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  SiApplicationHeaderComponent,
  SiHeaderBrandDirective,
  SiHeaderLogoDirective,
  SiHeaderNavigationComponent,
  SiHeaderNavigationItemComponent
} from '@spike-rabbit/element-ng/application-header';
import { SiSkipLinkTargetDirective } from '@spike-rabbit/element-ng/skip-links';

@Component({
  selector: 'app-sample',
  imports: [
    SiSkipLinkTargetDirective,
    SiApplicationHeaderComponent,
    SiHeaderNavigationItemComponent,
    SiHeaderNavigationComponent,
    RouterLink,
    SiHeaderBrandDirective,
    SiHeaderLogoDirective
  ],
  templateUrl: './si-skip-links.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {}
