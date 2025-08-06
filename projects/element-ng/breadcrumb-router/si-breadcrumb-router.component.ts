/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { BreadcrumbItem, SiBreadcrumbComponent } from '@spike-rabbit/element-ng/breadcrumb';
import { Observable, Subject, Subscription } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { SI_BREADCRUMB_RESOLVER_SERVICE } from './si-breadcrumb-router.model';

@Component({
  selector: 'si-breadcrumb-router',
  imports: [SiBreadcrumbComponent],
  templateUrl: './si-breadcrumb-router.component.html'
})
export class SiBreadcrumbRouterComponent implements OnInit, OnDestroy {
  /**
   * Aria label for the main breadcrumb navigation. Needed for a11y.
   *
   * @defaultValue 'breadcrumb'
   */
  readonly ariaLabel = input('breadcrumb');

  protected readonly items = signal<BreadcrumbItem[]>([]);

  private readonly currentCalcUrl = signal<string | undefined>(undefined);
  private nextRoute = new Subject<void>();
  private resolverService = inject(SI_BREADCRUMB_RESOLVER_SERVICE);
  private route? = inject(ActivatedRoute, { optional: true });
  private router? = inject(Router, { optional: true });
  private routerSubscription?: Subscription;

  ngOnInit(): void {
    this.checkItems();
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
    this.nextRoute.next();
  }

  private checkItems(): void {
    if (!this.routerSubscription && this.route && this.router) {
      this.routerSubscription = this.router.events
        .pipe(filter(e => e instanceof NavigationEnd))
        .subscribe(navigationEvent => {
          const event = navigationEvent as NavigationEnd;
          // Get the new url
          const newUrl = event.urlAfterRedirects || event.url;
          // Only update when url differs from previous url

          if (this.currentCalcUrl() !== newUrl) {
            this.currentCalcUrl.set(newUrl);
            this.nextRoute.next();
            this.computePath();
          }
        });

      if (this.router.navigated) {
        this.currentCalcUrl.set(this.router.url);
        this.computePath();
      }
    }
  }

  private computePath(): void {
    if (!this.route || !this.resolverService) {
      return;
    }

    // Get a snapshot of the all current activate routes
    const pathFromRoot: ActivatedRouteSnapshot[] = this.route.snapshot.pathFromRoot;

    // Find the child/leaf route that fits to the url
    const route = this.findRouteWithUrl(pathFromRoot, this.currentCalcUrl()?.split('?')[0] ?? '');

    if (route) {
      // Workaround to fix a bug that the route is null, in some cases
      const links$ = this.resolverService.resolve(route);
      if (links$ instanceof Observable) {
        links$.pipe(takeUntil(this.nextRoute)).subscribe(links => {
          this.items.set([{ link: '/', title: '/' }, ...links]);
        });
      } else {
        this.items.set([{ link: '/', title: '/' }, ...links$]);
      }
    }
  }

  private findRouteWithUrl(
    routes: ActivatedRouteSnapshot[],
    url: string
  ): ActivatedRouteSnapshot | null {
    let result: ActivatedRouteSnapshot | null = null;
    for (const route of routes) {
      const routeUrl = this.getUrl(route);
      if (url === routeUrl && !route.data?.siBreadcrumbIgnore) {
        result = route;
        break;
      } else {
        result = this.findRouteWithUrl(route.children, url);
        if (result != null) {
          break;
        }
      }
    }
    return result;
  }

  private getUrl(route: ActivatedRouteSnapshot): string {
    let url = '';
    for (const routeSegment of route.pathFromRoot) {
      const myUrl: string = routeSegment.url.map(o => o.toString()).join('/');
      if (!url.endsWith('/')) {
        url = url + '/';
      }
      url = url + myUrl;
    }
    return url;
  }
}
