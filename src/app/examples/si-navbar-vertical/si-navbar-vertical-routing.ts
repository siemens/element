/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Route, RouterLink, RouterOutlet } from '@angular/router';
import {
  SiApplicationHeaderComponent,
  SiHeaderBrandDirective,
  SiHeaderLogoDirective
} from '@siemens/element-ng/application-header';
import { SiBreadcrumbRouterComponent } from '@siemens/element-ng/breadcrumb-router';
import { Link, SiLinkDirective } from '@siemens/element-ng/link';
import { NavbarVerticalItem, SiNavbarVerticalComponent } from '@siemens/element-ng/navbar-vertical';
import { provideExampleRoutes } from '@siemens/live-preview';

// Dummy components to be used in the router outlet for the example
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
  selector: 'app-test-coverage',
  imports: [RouterOutlet, SiLinkDirective],
  template: `Total test coverage: 80%
    <br />
    <br />
    <a [siLink]="e2eRouterLink">Check E2E coverage details</a><br />
    <br />
    <a [siLink]="unitRouterLink">Check Unit tests coverage details</a>
    <br />
    <br />
    <router-outlet /> `
})
export class TestCoverageComponent {
  e2eRouterLink: Link = { link: 'e2e-coverage' };
  unitRouterLink: Link = { link: 'unit-coverage' };
}

@Component({
  selector: 'app-e2e-coverage',
  template: `E2E test coverage is 70%`
})
export class E2ECoverageComponent {}

@Component({
  selector: 'app-unit-coverage',
  template: `Unit test coverage is 90%`
})
export class UnitCoverageComponent {}

export const ROUTES: Route[] = [
  {
    path: 'home',
    component: HomeComponent
  },
  { path: 'energy', component: EnergyComponent },
  {
    path: 'coverage',
    component: TestCoverageComponent,
    children: [
      { path: 'e2e-coverage', component: E2ECoverageComponent },
      {
        path: 'unit-coverage',
        component: UnitCoverageComponent
      }
    ]
  }
];

@Component({
  selector: 'app-sample',
  imports: [
    SiNavbarVerticalComponent,
    SiApplicationHeaderComponent,
    SiHeaderBrandDirective,
    RouterLink,
    SiHeaderLogoDirective,
    RouterOutlet,
    SiBreadcrumbRouterComponent
  ],
  templateUrl: './si-navbar-vertical-routing.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideExampleRoutes(ROUTES)]
})
export class SampleComponent {
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
      type: 'router-link',
      label: 'Test coverage',
      icon: 'element-diagnostic',
      routerLink: 'coverage',
      badge: 4,
      badgeColor: 'danger'
    }
  ];
}
