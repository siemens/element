/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router, RouterLink, RouterOutlet } from '@angular/router';
import { SiBreadcrumbRouterComponent } from '@siemens/element-ng/breadcrumb-router';
import { provideExampleRoutes } from '@siemens/live-preview';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: '<a routerLink="catalog">Browse catalog</a>'
})
export class HomeComponent {}

@Component({
  selector: 'app-catalog',
  imports: [RouterOutlet],
  template: '<router-outlet />'
})
export class CatalogComponent {}

@Component({
  selector: 'app-catalog-overview',
  imports: [RouterLink],
  template: `
    <nav aria-label="Catalog pages" class="d-flex gap-4">
      <a routerLink="products">Products</a>
      <a routerLink="orders">Orders</a>
    </nav>
  `
})
export class CatalogOverviewComponent {}

@Component({
  selector: 'app-products',
  imports: [RouterLink],
  template: '<p>Products</p><a routerLink="../orders">View orders</a>'
})
export class ProductsComponent {}

@Component({
  selector: 'app-orders',
  imports: [RouterLink],
  template: '<p>Orders</p><a routerLink="../products">View products</a>'
})
export class OrdersComponent {}

export const ROUTES: Route[] = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  {
    path: 'catalog',
    component: CatalogComponent,
    data: { title: 'Catalog' },
    children: [
      { path: '', component: CatalogOverviewComponent, pathMatch: 'full' },
      { path: 'products', component: ProductsComponent, data: { title: 'Products' } },
      { path: 'orders', component: OrdersComponent, data: { title: 'Orders' } }
    ]
  }
];

@Component({
  selector: 'app-sample',
  imports: [RouterOutlet, SiBreadcrumbRouterComponent],
  templateUrl: './si-breadcrumb-router.html',
  providers: [provideExampleRoutes(ROUTES)],
  host: { class: 'p-5' }
})
export class SampleComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.router.navigate(['catalog', 'products'], { relativeTo: this.route });
  }
}
