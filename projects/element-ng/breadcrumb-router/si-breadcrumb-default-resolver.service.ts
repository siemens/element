/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { inject, Injectable, LOCALE_ID } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { BreadcrumbItem } from '@siemens/element-ng/breadcrumb';
import { Observable } from 'rxjs';

import { BreadcrumbRouterLink, SiBreadcrumbResolverService } from './si-breadcrumb-router.model';

@Injectable({ providedIn: 'root' })
export class SiBreadcrumbDefaultResolverService implements SiBreadcrumbResolverService {
  private locale = inject(LOCALE_ID).toString();

  /**
   * Method which resolves the route and creates the breadcrumb items from it.
   * Is called by the `si-breadcrumb-router-component` but can also be called manually in inheritance patterns.
   */
  resolve(route: ActivatedRouteSnapshot): BreadcrumbItem[] | Observable<BreadcrumbItem[]> {
    if (route.data.siBreadcrumb) {
      return this.resolveCustomRoutePart(route)!;
    } else {
      return this.resolveDefault(route);
    }
  }

  private resolveCustomRoutePart(route: ActivatedRouteSnapshot): BreadcrumbItem[] | undefined {
    if (route.data.siBreadcrumb) {
      const rawLinks = route.data.siBreadcrumb as BreadcrumbRouterLink[];
      return rawLinks.map(
        rl =>
          ({
            title: this.calculateName(route, rl.title),
            link: rl.link ? this.calculateUrl(route, rl.link) : route.fragment!
          }) as BreadcrumbItem
      );
    }
    return;
  }

  private resolveDefault(route: ActivatedRouteSnapshot | null): BreadcrumbItem[] {
    const links: BreadcrumbItem[] = [];
    let currRoute = route;
    while (currRoute != null) {
      if (currRoute.data.siBreadcrumb) {
        links.unshift(...this.resolveCustomRoutePart(currRoute)!);
      } else if (currRoute.url.length > 0) {
        const routeUrl: string = this.getUrl(currRoute);
        const routeName: string = this.getName(currRoute);
        let link: BreadcrumbItem;
        if (links.length === 0) {
          link = { title: routeName } as BreadcrumbItem;
        } else {
          link = { title: routeName, link: routeUrl } as BreadcrumbItem;
        }
        links.unshift(link);
      }
      currRoute = currRoute.parent;
    }
    return links;
  }

  private getUrl(route: ActivatedRouteSnapshot): string {
    const parent = route.parent;
    let url: string;
    if (parent != null) {
      url = this.getUrl(parent);
    } else {
      url = '';
    }
    const myUrl: string = route.url.map(o => o.toString()).join('/');
    if (!url.endsWith('/')) {
      url = url + '/';
    }
    url = url + myUrl;
    return url;
  }

  private getName(route: ActivatedRouteSnapshot): string {
    let name: string = route.data.title ?? route.url[0].path;
    if (typeof name === 'object') {
      name = name[this.locale];
    }

    return this.calculateName(route, name);
  }

  private calculateName(route: ActivatedRouteSnapshot, baseName: string): string {
    return this.calculate(route, baseName, /{(\w+)}/g);
  }

  private calculateUrl(route: ActivatedRouteSnapshot, baseName: string): string {
    return this.calculate(route, baseName, /:(\w+)\/?/g, ':', '');
  }

  private calculate(
    route: ActivatedRouteSnapshot,
    base: string,
    pattern: RegExp,
    replaceStart = '{',
    replaceEnd = '}'
  ): string {
    let name = base;
    const values: string[] = [];

    let finding: RegExpExecArray | null;
    // tslint:disable-next-line:no-conditional-assignment
    while ((finding = pattern.exec(name)) != null) {
      values.push(finding[1]);
    }

    values.forEach(value => {
      let replace = this.findParam(route, value);
      if (route.data.replaceValues) {
        replace = route.data.replaceValues[replace] ?? replace;
      }
      name = name.replace(`${replaceStart}${value}${replaceEnd}`, replace);
    });

    return name;
  }

  private findParam(route: ActivatedRouteSnapshot, paramKey: string): string {
    return (
      route.paramMap.get(paramKey) ??
      (route.parent ? this.findParam(route.parent, paramKey) : paramKey)
    );
  }
}
