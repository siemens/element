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
      routerLink: 'home',
      badge: 'New',
      badgeColor: 'default'
    },
    {
      type: 'router-link',
      label: 'Menu item',
      id: 'menu-item',
      icon: 'element-special-object',
      routerLink: 'menu-item'
    },
    { type: 'header', label: 'Modules' },
    {
      type: 'group',
      label: 'User management',
      id: 'user-management',
      icon: 'element-user-group',
      badge: 6,
      badgeColor: 'danger-emphasis',
      children: [
        {
          type: 'router-link',
          label: 'Sub item',
          routerLink: 'subItem',
          badge: 1,
          badgeColor: 'info'
        },
        {
          type: 'router-link',
          label: 'Sub item 2',
          routerLink: 'subItem2',
          badge: 3,
          badgeColor: 'danger-emphasis'
        },
        {
          type: 'router-link',
          label: 'Sub item 3',
          routerLink: 'subItem3',
          badge: 2,
          badgeColor: 'warning'
        }
      ]
    },
    {
      type: 'group',
      label: 'Documentation',
      id: 'documentation',
      icon: 'element-document',
      badge: 1,
      badgeColor: 'info-emphasis',
      children: [
        { type: 'router-link', label: 'Sub item 4', routerLink: 'subItem4' },
        {
          type: 'router-link',
          label: 'Sub item 5',
          routerLink: 'subItem5',
          badge: 1,
          badgeColor: 'info-emphasis'
        },
        { type: 'router-link', label: 'Sub item 6', routerLink: 'subItem6' }
      ]
    },
    {
      type: 'router-link',
      label: 'Test coverage',
      icon: 'element-diagnostic',
      routerLink: 'coverage'
    },
    { type: 'divider' },
    {
      // AVOID USING `type: 'action'`.
      // Actions inside the navbar are an indication for a code smell.
      // Use `type: 'router-link'` instead whenever possible.
      type: 'action',
      label: 'Action',
      icon: 'element-warning',
      active: false,
      action: () => this.logEvent('Callback for action called'),
      badge: 'Hot',
      badgeColor: 'danger'
    },
    {
      type: 'router-link',
      label: 'Energy & sustainability',
      icon: 'element-trend',
      routerLink: 'energy',
      badge: 100,
      badgeColor: 'success',
      showSubtleBadgeCollapsed: true
    }
  ];

  private activeRoute = inject(ActivatedRoute);
  private router = inject(Router);
  logEvent = inject(LOG_EVENT);

  ngOnInit(): void {
    this.router.navigate(['home'], { relativeTo: this.activeRoute });
  }
}
