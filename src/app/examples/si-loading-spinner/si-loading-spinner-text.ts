/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  SiApplicationHeaderComponent,
  SiHeaderAccountItemComponent,
  SiHeaderActionsDirective,
  SiHeaderBrandDirective,
  SiHeaderLogoDirective
} from '@siemens/element-ng/application-header';
import {
  SiHeaderDropdownComponent,
  SiHeaderDropdownTriggerDirective
} from '@siemens/element-ng/header-dropdown';
import { SiLoadingSpinnerDirective } from '@siemens/element-ng/loading-spinner';
import { NavbarVerticalItem, SiNavbarVerticalComponent } from '@siemens/element-ng/navbar-vertical';

@Component({
  selector: 'app-sample',
  imports: [
    SiApplicationHeaderComponent,
    SiHeaderActionsDirective,
    SiHeaderAccountItemComponent,
    SiHeaderDropdownComponent,
    SiHeaderDropdownTriggerDirective,
    SiHeaderBrandDirective,
    SiNavbarVerticalComponent,
    RouterLink,
    SiHeaderLogoDirective,
    SiLoadingSpinnerDirective
  ],
  templateUrl: './si-loading-spinner-text.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent implements OnInit {
  menuItems: NavbarVerticalItem[] = [
    {
      type: 'router-link',
      label: 'Home',
      id: 'home',
      icon: 'element-home',
      routerLink: 'home'
    },
    {
      type: 'router-link',
      label: 'Load Monitoring',
      icon: 'element-trend',
      routerLink: 'load-monitoring'
    },
    {
      type: 'router-link',
      label: 'Devices',
      icon: 'element-device',
      routerLink: 'devices'
    },
    {
      type: 'router-link',
      label: 'Settings',
      icon: 'element-settings',
      routerLink: 'settings'
    }
  ];

  private activeRoute = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    this.router.navigate(['load-monitoring'], { relativeTo: this.activeRoute });
  }
}
