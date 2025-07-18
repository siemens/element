/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import {
  SiApplicationHeaderComponent,
  SiHeaderBrandDirective,
  SiHeaderLogoDirective
} from '@siemens/element-ng/application-header';
import { NavbarVerticalItem, SiNavbarVerticalComponent } from '@siemens/element-ng/navbar-vertical';
import { EXAMPLE_ROUTE_MAP, LOG_EVENT } from '@siemens/live-preview';

// Dummy components to be used in the router outlet for the example
@Component({
  selector: 'app-home',
  template: `Default path content`
})
export class DefaultComponent {}

@Component({
  selector: 'app-home',
  template: `This is the home page`
})
export class HomeComponent {}

@Component({
  selector: 'app-energy',
  template: `Energy consumption`
})
export class EnergyComponent {}

@Component({
  selector: 'app-coverage',
  template: `Total test coverage: 80%`
})
export class CoverageComponent {}

@Component({
  selector: 'app-sub-item-1',
  template: `Sub item 1 content`
})
export class SubItem1Component {}

@Component({
  selector: 'app-sub-item-2',
  template: `Sub item 2 content`
})
export class SubItem2Component {}

export const exampleRouteMap = {
  '': DefaultComponent,
  route1: HomeComponent,
  route2: EnergyComponent,
  route3: SubItem1Component,
  route4: CoverageComponent,
  route5: SubItem2Component
};

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: EXAMPLE_ROUTE_MAP, useValue: exampleRouteMap }]
})
export class SampleComponent {
  menuItems: NavbarVerticalItem[] = [
    {
      type: 'router-link',
      label: 'Home',
      id: 'home',
      icon: 'element-home',
      routerLink: 'route1'
    },
    { type: 'header', label: 'Modules' },
    {
      type: 'router-link',
      label: 'Energy & sustainability',
      icon: 'element-trend',
      routerLink: 'route2'
    },
    {
      type: 'group',
      label: 'User management',
      id: 'user-management',
      icon: 'element-user-group',
      children: [
        {
          type: 'router-link',
          label: 'Sub item 1',
          routerLink: 'route3',
          badge: 4,
          badgeColor: 'warning'
        }
      ]
    },
    {
      type: 'router-link',
      label: 'Test coverage',
      icon: 'element-diagnostic',
      routerLink: 'route4',
      badge: 4,
      badgeColor: 'danger'
    },
    { type: 'divider' },
    {
      type: 'group',
      label: 'Documentation',
      id: 'documentation',
      icon: 'element-document',
      children: [{ type: 'router-link', label: 'Sub item 2', routerLink: 'route5' }]
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

  logEvent = inject(LOG_EVENT);
}
