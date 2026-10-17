/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, OnInit, signal } from '@angular/core';
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
  SiNavbarVerticalNextComponent,
  SiNavbarVerticalNextDividerComponent,
  SiNavbarVerticalNextFooterItemsComponent,
  SiNavbarVerticalNextGroupComponent,
  SiNavbarVerticalNextGroupTriggerDirective,
  SiNavbarVerticalNextHeaderComponent,
  SiNavbarVerticalNextItemComponent,
  SiNavbarVerticalNextItemsComponent,
  SiNavbarVerticalNextNavigationActionComponent,
  SiNavbarVerticalNextSearchComponent
} from '@siemens/element-ng/navbar-vertical-next';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [
    RouterLink,
    RouterOutlet,
    RouterLinkActive,
    SiApplicationHeaderComponent,
    SiHeaderBrandDirective,
    SiHeaderLogoDirective,
    SiNavbarVerticalNextComponent,
    SiNavbarVerticalNextDividerComponent,
    SiNavbarVerticalNextFooterItemsComponent,
    SiNavbarVerticalNextGroupComponent,
    SiNavbarVerticalNextGroupTriggerDirective,
    SiNavbarVerticalNextHeaderComponent,
    SiNavbarVerticalNextItemComponent,
    SiNavbarVerticalNextItemsComponent,
    SiNavbarVerticalNextNavigationActionComponent,
    SiNavbarVerticalNextSearchComponent
  ],
  templateUrl: './si-navbar-vertical-next-leading-action.html'
})
export class SampleComponent implements OnInit {
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private returnUrl = this.router.url;
  readonly logEvent = inject(LOG_EVENT);

  readonly configurationOpen = signal(false);

  ngOnInit(): void {
    this.router.navigate(['home'], { relativeTo: this.activeRoute });
  }

  openConfiguration(): void {
    this.returnUrl = this.router.url;
    this.configurationOpen.set(true);
  }

  closeConfiguration(): void {
    this.configurationOpen.set(false);
    this.router.navigateByUrl(this.returnUrl);
  }

  selectConfigurationItem(item: number): void {
    this.logEvent(`Callback for configuration item ${item} called`);
  }
}
