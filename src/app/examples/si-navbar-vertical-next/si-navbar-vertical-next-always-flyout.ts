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
  SiNavbarVerticalNextSearchComponent,
  SiNavbarVerticalNextItemsComponent,
  SiNavbarVerticalNextComponent,
  SiNavbarVerticalNextDividerComponent,
  SiNavbarVerticalNextFooterItemsComponent,
  SiNavbarVerticalNextGroupComponent,
  SiNavbarVerticalNextGroupTriggerDirective,
  SiNavbarVerticalNextHeaderComponent,
  SiNavbarVerticalNextItemComponent
} from '@siemens/element-ng/navbar-vertical-next';

@Component({
  selector: 'app-sample',
  imports: [
    SiNavbarVerticalNextComponent,
    SiNavbarVerticalNextSearchComponent,
    SiNavbarVerticalNextItemsComponent,
    SiNavbarVerticalNextFooterItemsComponent,
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
  templateUrl: './si-navbar-vertical-next-always-flyout.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent implements OnInit {
  private activeRoute = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    this.router.navigate(['home'], { relativeTo: this.activeRoute });
  }
}
