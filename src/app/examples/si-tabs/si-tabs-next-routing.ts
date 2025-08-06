/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { AfterViewInit, Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { Link, SiLinkDirective } from '@spike-rabbit/element-ng/link';
import { SiTabsetNextComponent, SiTabNextLinkComponent } from '@spike-rabbit/element-ng/tabs-next';
import { provideExampleRoutes } from '@spike-rabbit/live-preview';

// Dummy components to be used in the router outlet for the example
@Component({
  selector: 'app-home',
  template: `<div class="p-5">This is the home page</div>`
})
export class HomeComponent {}

@Component({
  selector: 'app-energy',
  template: `<div class="p-5">Energy consumption</div>`
})
export class EnergyComponent {}

@Component({
  selector: 'app-test-coverage',
  imports: [RouterOutlet, SiLinkDirective],
  template: `<div class="p-5"
    >Total test coverage: 80%
    <br />
    <br />
    <a [siLink]="e2eRouterLink">Check E2E coverage details</a><br />
    <br />
    <a [siLink]="unitRouterLink">Check Unit tests coverage details</a>
    <br />
    <br />
    <router-outlet />
  </div>`
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

@Component({
  selector: 'app-sample',
  imports: [SiTabsetNextComponent, SiTabNextLinkComponent, RouterOutlet, RouterLink],
  templateUrl: './si-tabs-next-routing.html',
  providers: [
    provideExampleRoutes([
      {
        path: 'tab-1',
        component: HomeComponent
      },
      {
        path: 'tab-2',
        component: EnergyComponent
      },
      {
        path: 'tab-3',
        component: TestCoverageComponent,
        children: [
          { path: 'e2e-coverage', component: E2ECoverageComponent },
          {
            path: 'unit-coverage',
            component: UnitCoverageComponent
          }
        ]
      }
    ])
  ],
  host: { class: 'p-5' }
})
export class SampleComponent implements AfterViewInit {
  protected tabLink1 = ['tab-1'];
  protected tabLink2 = ['tab-2'];
  protected tabLink3 = ['tab-3'];

  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  ngAfterViewInit(): void {
    // Wait for live preview to initialize the router configs
    setTimeout(() => {
      this.router.navigate(this.tabLink1, {
        relativeTo: this.activatedRoute
      });
    }, 1);
  }
}
