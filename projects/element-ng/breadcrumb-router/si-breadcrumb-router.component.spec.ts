/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, ElementRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterOutlet, Routes } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import {
  provideMissingTranslationHandlerForElement,
  provideNgxTranslateForElement
} from '@siemens/element-translate-ng/ngx-translate';

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideTranslateService({
          missingTranslationHandler: provideMissingTranslationHandlerForElement()
        }),
        provideNgxTranslateForElement(),
        {
          provide: SI_BREADCRUMB_RESOLVER_SERVICE,
          useClass: SiBreadcrumbDefaultResolverService
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WrapperComponent);
    wrapperComponent = fixture.componentInstance;
    component = wrapperComponent.breadcrumbResolver();
    element = component.nativeElement.firstElementChild;
    router = TestBed.inject(Router);
  });

  it('should display route items using breadcrumb resolver', async () => {
    router.navigateByUrl('/');

    await fixture.whenStable();

    expect(
      (element.querySelector('.breadcrumb .item') as HTMLElement).querySelector(
        '.icon-sm:not(.separator)'
      )
    ).toBeInTheDocument();
    expect(
      (element.querySelectorAll('.breadcrumb .item')[1] as HTMLElement).querySelector(
        '.icon-sm:not(.separator)'
      )
    ).not.toBeInTheDocument();
    expect(element.querySelectorAll('.breadcrumb .item')[1] as HTMLElement).toHaveTextContent(
      routes[0].children![0].data?.title
    );
  });

  it('should change on route change using breadcrumb resolver', async () => {
    router.navigateByUrl('/');

    await fixture.whenStable();

    expect(
      (element.querySelector('.breadcrumb .item') as HTMLElement).querySelector(
        '.icon-sm:not(.separator)'
      )
    ).toBeInTheDocument();
    expect(
      (element.querySelectorAll('.breadcrumb .item')[1] as HTMLElement).querySelector(
        '.icon-sm:not(.separator)'
      )
    ).not.toBeInTheDocument();
    expect(element.querySelectorAll('.breadcrumb .item')[1] as HTMLElement).toHaveTextContent(
      routes[0].children![0].data?.title
    );

    router.navigate(['child']);

    await fixture.whenStable();

    expect(
      (element.querySelector('.breadcrumb .item') as HTMLElement).querySelector(
        '.icon-sm:not(.separator)'
      )
    ).toBeInTheDocument();
    expect(
      (element.querySelectorAll('.breadcrumb .item')[1] as HTMLElement).querySelector(
        '.icon-sm:not(.separator)'
      )
    ).not.toBeInTheDocument();
    expect(
      (element.querySelectorAll('.breadcrumb .item')[2] as HTMLElement).querySelector(
        '.icon-sm:not(.separator)'
      )
    ).not.toBeInTheDocument();
    expect(element.querySelectorAll('.breadcrumb .item')[1] as HTMLElement).toHaveTextContent(
      routes[0].children![1].data?.title
    );
    expect(element.querySelectorAll('.breadcrumb .item')[2] as HTMLElement).toHaveTextContent(
      routes[0].children![1].children![0].data?.title
    );
  });
});
