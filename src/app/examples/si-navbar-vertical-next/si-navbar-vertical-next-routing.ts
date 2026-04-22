/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  Route,
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
import { SiBreadcrumbRouterComponent } from '@siemens/element-ng/breadcrumb-router';
import { Link, SiLinkDirective } from '@siemens/element-ng/link';
import {
  SiNavbarVerticalNextSearchComponent,
  SiNavbarVerticalNextItemsComponent,
  SiNavbarVerticalNextComponent,
  SiNavbarVerticalNextHeaderComponent,
  SiNavbarVerticalNextItemComponent
} from '@siemens/element-ng/navbar-vertical-next';
import { provideExampleRoutes } from '@siemens/live-preview';

// Dummy components to be used in the router outlet for the example
@Component({
  selector: 'app-home',
  template: `This is the home page`
})
export class HomeComponent {}

@Component({
  selector: 'app-menu-item',
  template: `This is a sample menu item page`
})
export class MenuItemComponent {}

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
  {
    path: 'menu-item',
    component: MenuItemComponent
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
    SiNavbarVerticalNextComponent,
    SiNavbarVerticalNextSearchComponent,
    SiNavbarVerticalNextItemsComponent,
    SiNavbarVerticalNextItemComponent,
    SiNavbarVerticalNextHeaderComponent,
    SiApplicationHeaderComponent,
    SiHeaderBrandDirective,
    SiHeaderLogoDirective,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    SiBreadcrumbRouterComponent
  ],
  templateUrl: './si-navbar-vertical-next-routing.html',
  providers: [provideExampleRoutes(ROUTES)],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent implements OnInit {
  private activeRoute = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    this.router.navigate(['home'], { relativeTo: this.activeRoute });
  }
}
