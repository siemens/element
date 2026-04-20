/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';
import {
  SiApplicationHeaderComponent,
  SiHeaderBrandDirective,
  SiHeaderLogoDirective
} from '@siemens/element-ng/application-header';
import {
  SiNavbarVerticalItemsNextComponent,
  SiNavbarVerticalNextComponent,
  SiNavbarVerticalNextDividerComponent,
  SiNavbarVerticalNextGroupComponent,
  SiNavbarVerticalNextGroupTriggerDirective,
  SiNavbarVerticalNextHeaderComponent,
  SiNavbarVerticalNextItemComponent
} from '@siemens/element-ng/navbar-vertical-next';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [
    SiNavbarVerticalNextComponent,
    SiNavbarVerticalItemsNextComponent,
    SiNavbarVerticalNextItemComponent,
    SiNavbarVerticalNextGroupComponent,
    SiNavbarVerticalNextGroupTriggerDirective,
    SiNavbarVerticalNextHeaderComponent,
    SiNavbarVerticalNextDividerComponent,
    SiApplicationHeaderComponent,
    SiHeaderBrandDirective,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    SiHeaderLogoDirective
  ],
  templateUrl: './si-navbar-vertical-next.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent implements OnInit {
  private activeRoute = inject(ActivatedRoute);
  private router = inject(Router);
  logEvent = inject(LOG_EVENT);

  ngOnInit(): void {
    this.router.navigate(['home'], { relativeTo: this.activeRoute });
  }
}
