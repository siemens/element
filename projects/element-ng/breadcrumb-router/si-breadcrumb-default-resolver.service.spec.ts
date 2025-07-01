/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { UrlSegment } from '@angular/router';
import { BreadcrumbItem } from '@siemens/element-ng/breadcrumb';

import { SiBreadcrumbDefaultResolverService } from './si-breadcrumb-default-resolver.service';

interface FakeActivatedRouteSnapshot {
  url: UrlSegment[];
  paramMap: Map<string, unknown>;
  fragment: string;
  data: unknown;
  parent: FakeActivatedRouteSnapshot | null;
}

describe('BreadcrumbDefaultResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SiBreadcrumbDefaultResolverService, provideHttpClientTesting()]
    });
  });

  it('should resolve basic route with parent and title', inject(
    [SiBreadcrumbDefaultResolverService],
    (service: SiBreadcrumbDefaultResolverService) => {
      const fakeRoute: FakeActivatedRouteSnapshot = {
        url: [new UrlSegment('test', {})],
        data: { title: 'test title' },
        fragment: 'test',
        paramMap: new Map<string, unknown>(),
        parent: {
          url: [new UrlSegment('parent', {})],
          data: {},
          fragment: 'parent',
          paramMap: new Map<string, unknown>(),
          parent: null
        }
      };
      const expectedBreadcrumbRoute: BreadcrumbItem[] = [
        { title: 'parent', link: '/parent' },
        { title: 'test title' }
      ];
      expect(service.resolve(fakeRoute as unknown as any)).toEqual(
        expectedBreadcrumbRoute as unknown as any
      );
    }
  ));

  it('should resolve nested route with parents', inject(
    [SiBreadcrumbDefaultResolverService],
    (service: SiBreadcrumbDefaultResolverService) => {
      const fakeRoute: FakeActivatedRouteSnapshot = {
        url: [new UrlSegment('test', {})],
        data: { title: 'test title' },
        fragment: 'test',
        paramMap: new Map<string, unknown>(),
        parent: {
          url: [new UrlSegment('parent', {})],
          data: {},
          fragment: 'parent',
          paramMap: new Map<string, unknown>(),
          parent: {
            url: [new UrlSegment('grandparent', {})],
            data: {},
            fragment: 'grandparent',
            paramMap: new Map<string, unknown>(),
            parent: null
          }
        }
      };
      const expectedBreadcrumbRoute: BreadcrumbItem[] = [
        { title: 'grandparent', link: '/grandparent' },
        { title: 'parent', link: '/grandparent/parent' },
        { title: 'test title' }
      ];
      expect(service.resolve(fakeRoute as unknown as any)).toEqual(
        expectedBreadcrumbRoute as unknown as any
      );
    }
  ));

  it('should resolve routes with custom breadcrumb', inject(
    [SiBreadcrumbDefaultResolverService],
    (service: SiBreadcrumbDefaultResolverService) => {
      const fakeRoute: FakeActivatedRouteSnapshot = {
        url: [new UrlSegment('test', {})],
        data: {
          siBreadcrumb: [{ title: 'custom title', link: '/test' }]
        },
        fragment: 'test',
        paramMap: new Map<string, unknown>(),
        parent: {
          url: [new UrlSegment('parent', {})],
          data: {},
          fragment: 'parent',
          paramMap: new Map<string, unknown>(),
          parent: null
        }
      };
      const expectedBreadcrumbRoute: BreadcrumbItem[] = [{ title: 'custom title', link: '/test' }];
      expect(service.resolve(fakeRoute as unknown as any)).toEqual(
        expectedBreadcrumbRoute as unknown as any
      );
    }
  ));

  it('should resolve routes with custom raw breadcrumb', inject(
    [SiBreadcrumbDefaultResolverService],
    (service: SiBreadcrumbDefaultResolverService) => {
      const fakeRoute: FakeActivatedRouteSnapshot = {
        url: [new UrlSegment('test', {})],
        data: {
          siBreadcrumb: [{ title: 'custom title', link: '/test' }]
        },
        fragment: 'test',
        paramMap: new Map<string, unknown>(),
        parent: {
          url: [new UrlSegment('parent', {})],
          data: {},
          fragment: 'parent',
          paramMap: new Map<string, unknown>(),
          parent: null
        }
      };
      const expectedBreadcrumbRoute: BreadcrumbItem[] = [{ title: 'custom title', link: '/test' }];
      expect(service.resolve(fakeRoute as unknown as any)).toEqual(
        expectedBreadcrumbRoute as unknown as any
      );
    }
  ));

  it('should resolve child routes with inherited custom breadcrumb', inject(
    [SiBreadcrumbDefaultResolverService],
    (service: SiBreadcrumbDefaultResolverService) => {
      const fakeRoute: FakeActivatedRouteSnapshot = {
        url: [new UrlSegment('test', {})],
        data: { title: 'child title' },
        fragment: 'test',
        paramMap: new Map<string, unknown>(),
        parent: {
          url: [new UrlSegment('test', {})],
          data: { title: 'test title' },
          fragment: 'test',
          paramMap: new Map<string, unknown>(),
          parent: {
            url: [new UrlSegment('parent', {})],
            data: { siBreadcrumb: [{ title: 'custom parent', link: '/custom' }] },
            fragment: 'parent',
            paramMap: new Map<string, unknown>(),
            parent: null
          }
        }
      };
      const expectedBreadcrumbRoute: BreadcrumbItem[] = [
        { title: 'custom parent', link: '/custom' },
        { title: 'test title', link: '/parent/test' },
        { title: 'child title' }
      ];
      expect(service.resolve(fakeRoute as unknown as any)).toEqual(
        expectedBreadcrumbRoute as unknown as any
      );
    }
  ));
});
