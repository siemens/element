/**
 * Copyright (c) Siemens 2016 - 2026
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
  templateUrl: './si-navbar-vertical-badges.html',
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
      badge: 'Text',
      hideBadgeWhenCollapsed: true
    },
    { type: 'header', label: 'Badge Examples' },
    {
      type: 'router-link',
      label: 'Text badge',
      icon: 'element-info',
      routerLink: 'text-badge',
      badge: 'Info',
      badgeColor: 'info-emphasis'
    },
    {
      type: 'group',
      label: 'Group with badges',
      id: 'group-with-badges',
      icon: 'element-user-group',
      badge: 6,
      badgeColor: 'critical-emphasis',
      children: [
        {
          type: 'router-link',
          label: 'Sub item critical',
          routerLink: 'sub-badge-1',
          badge: 1,
          badgeColor: 'critical-emphasis'
        },
        {
          type: 'router-link',
          label: 'Sub item info',
          routerLink: 'sub-badge-2',
          badge: 2,
          badgeColor: 'info'
        },
        {
          type: 'router-link',
          label: 'Sub item warning',
          routerLink: 'sub-badge-3',
          badge: 3,
          badgeColor: 'warning'
        }
      ]
    },
    {
      type: 'group',
      label: 'Group item',
      icon: 'element-special-object',
      children: [
        {
          type: 'router-link',
          label: 'Sub item',
          routerLink: 'sub-badge-4'
        },
        {
          type: 'router-link',
          label: 'Sub item',
          routerLink: 'sub-badge-5'
        },
        {
          type: 'router-link',
          label: 'Sub item',
          routerLink: 'sub-badge-6'
        }
      ]
    },
    { type: 'divider' },
    {
      type: 'router-link',
      label: 'Subtle badge',
      icon: 'element-checked',
      routerLink: 'success',
      badge: 5,
      badgeColor: 'success'
    },
    {
      type: 'router-link',
      label: 'Danger emphasis badge',
      icon: 'element-warning',
      routerLink: 'danger',
      badge: 100,
      badgeColor: 'danger-emphasis'
    }
  ];

  private activeRoute = inject(ActivatedRoute);
  private router = inject(Router);
  logEvent = inject(LOG_EVENT);

  ngOnInit(): void {
    this.router.navigate(['home'], { relativeTo: this.activeRoute });
  }
}
