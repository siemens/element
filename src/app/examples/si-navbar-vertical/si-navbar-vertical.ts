/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import {
  SiApplicationHeaderComponent,
  SiHeaderBrandDirective,
  SiHeaderLogoDirective
} from '@siemens/element-ng/application-header';
import { NavbarVerticalItem, SiNavbarVerticalComponent } from '@siemens/element-ng/navbar-vertical';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [
    SiNavbarVerticalComponent,
    SiApplicationHeaderComponent,
    SiHeaderBrandDirective,
    RouterLink,
    RouterOutlet,
    SiHeaderLogoDirective
  ],
  templateUrl: './si-navbar-vertical.html',
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
    { type: 'header', label: 'Modules' },
    {
      type: 'router-link',
      label: 'Energy & sustainability',
      icon: 'element-trend',
      routerLink: 'energy'
    },
    {
      type: 'group',
      label: 'User management',
      id: 'user-management',
      icon: 'element-user-group',
      children: [
        {
          type: 'router-link',
          label: 'Sub item',
          routerLink: 'subItem',
          badge: 4,
          badgeColor: 'warning'
        },
        { type: 'router-link', label: 'Sub item 2', routerLink: 'subItem2' },
        { type: 'router-link', label: 'Sub item 3', routerLink: 'subItem3' }
      ]
    },
    {
      type: 'router-link',
      label: 'Test coverage',
      icon: 'element-diagnostic',
      routerLink: 'coverage',
      badge: 4,
      badgeColor: 'danger'
    },
    { type: 'divider' },
    {
      type: 'group',
      label: 'Documentation',
      id: 'documentation',
      icon: 'element-document',
      children: [
        { type: 'router-link', label: 'Sub item 4', routerLink: 'subItem4' },
        { type: 'router-link', label: 'Sub item 5', routerLink: 'subItem5' },
        { type: 'router-link', label: 'Sub item 6', routerLink: 'subItem6' }
      ]
    },
    {
      // AVOID USING `type: 'action'`.
      // Actions inside the navbar are an indication for a code smell.
      // Use `type: 'router-link'` instead whenever possible.
      type: 'action',
      label: 'Action',
      icon: 'element-warning',
      active: false,
      action: item => {
        item.active = true;
        this.logEvent('Callback for action called');
      }
    }
  ];

  private activeRoute = inject(ActivatedRoute);
  private router = inject(Router);
  logEvent = inject(LOG_EVENT);

  ngOnInit(): void {
    this.router.navigate(['home'], { relativeTo: this.activeRoute });
  }
}
