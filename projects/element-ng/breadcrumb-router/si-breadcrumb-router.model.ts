/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { inject, InjectionToken } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { BreadcrumbItem } from '@siemens/element-ng/breadcrumb';
import { TranslatableString } from '@siemens/element-translate-ng/translate';
import { Observable } from 'rxjs';

import { SiBreadcrumbDefaultResolverService } from './si-breadcrumb-default-resolver.service';

/**
 * Defines the title and link of a breadcrumb item in a
 * route configuration and compatible to {@link BreadcrumbItem}.
 *
 * ```
 * {
 *   path: 'user-manual',
 *   component: UserManualComponent,
 *   data: {
 *     siBreadcrumb: [
 *       { title: 'USER_MANUAL.HEADING', link: '/main/user-manual' }
 *     ]
 *   }
 * }
 * ```
 *
 */
export interface BreadcrumbRouterLink {
  /**
   * Angular router link for the breadcrumb item.
   */
  link?: string;
  /**
   * Breadcrumb item title that will be translated.
   */
  title: TranslatableString;
}

/**
 * Service interface to resolve the breadcrumb items on the base of a route.
 */
export interface SiBreadcrumbResolverService {
  resolve(route: ActivatedRouteSnapshot): BreadcrumbItem[] | Observable<BreadcrumbItem[]>;
}

/**
 * Injection token to provide your own `SiBreadcrumbResolverService` implementation.
 *
 * ```
 * providers: [{
 *   provide: SI_BREADCRUMB_RESOLVER_SERVICE,
 *   useClass: CustomBreadcrumbResolverService,
 * }]
 * ```
 */
export const SI_BREADCRUMB_RESOLVER_SERVICE = new InjectionToken<SiBreadcrumbResolverService>(
  'si.breadcrumb.resolver.service',
  { providedIn: 'root', factory: () => inject(SiBreadcrumbDefaultResolverService) }
);
