/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import {
  SiApplicationHeaderComponent,
  SiHeaderBrandDirective,
  SiHeaderLogoDirective
} from '@siemens/element-ng/application-header';
import { SiBreadcrumbRouterComponent } from '@siemens/element-ng/breadcrumb-router';
import { Link, SiLinkDirective } from '@siemens/element-ng/link';
import { NavbarVerticalItem, SiNavbarVerticalComponent } from '@siemens/element-ng/navbar-vertical';
import { EXAMPLE_ROUTE_MAP } from '@siemens/live-preview';

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
  e2eRouterLink: Link = { link: 'child1' };
  unitRouterLink: Link = { link: 'child2' };
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

export const exampleRouteMap = {
  route1: HomeComponent,
  route2: EnergyComponent,
  route3: TestCoverageComponent,
  'route3/child1': E2ECoverageComponent,
  'route3/child2': UnitCoverageComponent
};

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
  providers: [{ provide: EXAMPLE_ROUTE_MAP, useValue: exampleRouteMap }]
})
export class SampleComponent implements OnInit {
  private router = inject(Router);
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
      type: 'router-link',
      label: 'Test coverage',
      icon: 'element-diagnostic',
      routerLink: 'route3',
      badge: 4,
      badgeColor: 'danger'
    }
  ];

  ngOnInit(): void {
    this.router.navigate(['iframe/route1']);
  }
}
