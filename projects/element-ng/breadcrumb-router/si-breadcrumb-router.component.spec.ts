/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, ElementRef, viewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, waitForAsync } from '@angular/core/testing';
import { Router, RouterModule, RouterOutlet, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { BreadcrumbItem } from '@siemens/element-ng/breadcrumb';

import {
  SI_BREADCRUMB_RESOLVER_SERVICE,
  SiBreadcrumbRouterComponent as TestComponent
} from './index';
import { SiBreadcrumbDefaultResolverService } from './si-breadcrumb-default-resolver.service';

@Component({
  imports: [TestComponent, RouterOutlet],
  template: `
    <si-breadcrumb-router />
    <router-outlet />
  `
})
class WrapperComponent {
  readonly breadcrumbResolver = viewChild.required(TestComponent, { read: ElementRef });
  items?: BreadcrumbItem[];
}

@Component({ template: '' })
class TestSubComponent {}

describe('SiBreadcrumbRouterComponent', () => {
  let fixture: ComponentFixture<WrapperComponent>;
  let wrapperComponent: WrapperComponent;
  let component: ElementRef;
  let element: HTMLElement;
  let router: Router;

  const routes: Routes = [
    {
      path: '',
      component: TestSubComponent,
      data: { title: 'Root' },
      children: [
        {
          path: 'home',
          component: TestSubComponent,
          data: { title: 'Home' }
        },
        {
          path: 'child',
          component: TestSubComponent,
          data: { title: 'Child' },
          children: [
            {
              path: 'sub',
              component: TestSubComponent,
              data: { title: 'Sub' }
            },
            {
              path: '**',
              redirectTo: 'sub'
            }
          ]
        },
        {
          path: '**',
          redirectTo: 'home'
        }
      ]
    }
  ];

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TestComponent,
        RouterModule.forRoot(routes),
        TranslateModule.forRoot(),
        WrapperComponent
      ],
      providers: [
        {
          provide: SI_BREADCRUMB_RESOLVER_SERVICE,
          useClass: SiBreadcrumbDefaultResolverService
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WrapperComponent);
    wrapperComponent = fixture.componentInstance;
    component = wrapperComponent.breadcrumbResolver();
    element = component.nativeElement.firstElementChild;
    router = TestBed.inject(Router);
  });

  it('should display route items using breadcrumb resolver', fakeAsync(() => {
    fixture.ngZone!.run(() => {
      router.navigateByUrl('/');

      fixture.detectChanges();
      flush();
      fixture.detectChanges();

      expect(
        (element.querySelector('.breadcrumb .item') as HTMLElement).querySelector('.icon')
      ).not.toBeNull();
      expect(
        (element.querySelectorAll('.breadcrumb .item')[1] as HTMLElement).querySelector('.icon')
      ).toBeNull();
      expect((element.querySelectorAll('.breadcrumb .item')[1] as HTMLElement).innerText).toBe(
        routes[0].children![0].data?.title
      );
    });
  }));

  it('should change on route change using breadcrumb resolver', fakeAsync(() => {
    fixture.ngZone!.run(() => {
      router.navigateByUrl('/');

      fixture.detectChanges();
      flush();
      fixture.detectChanges();

      expect(
        (element.querySelector('.breadcrumb .item') as HTMLElement).querySelector('.icon')
      ).not.toBeNull();
      expect(
        (element.querySelectorAll('.breadcrumb .item')[1] as HTMLElement).querySelector('.icon')
      ).toBeNull();
      expect((element.querySelectorAll('.breadcrumb .item')[1] as HTMLElement).innerText).toBe(
        routes[0].children![0].data?.title
      );

      router.navigate(['child']);

      fixture.detectChanges();
      flush();
      fixture.detectChanges();

      expect(
        (element.querySelector('.breadcrumb .item') as HTMLElement).querySelector('.icon')
      ).not.toBeNull();
      expect(
        (element.querySelectorAll('.breadcrumb .item')[1] as HTMLElement).querySelector('.icon')
      ).toBeNull();
      expect(
        (element.querySelectorAll('.breadcrumb .item')[2] as HTMLElement).querySelector('.icon')
      ).toBeNull();
      expect((element.querySelectorAll('.breadcrumb .item')[1] as HTMLElement).innerText).toBe(
        routes[0].children![1].data?.title
      );
      expect((element.querySelectorAll('.breadcrumb .item')[2] as HTMLElement).innerText).toBe(
        routes[0].children![1].children![0].data?.title
      );
    });
  }));
});
