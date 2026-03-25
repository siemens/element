/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import {
  provideMockTranslateServiceBuilder,
  SiTranslateService
} from '@siemens/element-translate-ng/translate';
import { of } from 'rxjs';

import { Link, LinkAction } from './link.model';
import { SiLinkActionService } from './si-link-action.service';
import { SI_LINK_DEFAULT_NAVIGATION_EXTRA, SiLinkDirective } from './si-link.directive';

@Component({
  imports: [SiLinkDirective],
  template: `<a
    activeClass="active"
    [siLink]="link()"
    [actionParam]="param()"
    (activeChange)="activeChange($event)"
  >
    Testli
  </a>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
  readonly link = signal<Link | undefined>({});
  readonly param = signal<any>({ some: 'thing' });
  readonly activeChange = vi.fn();
}

@Component({
  selector: 'si-empty',
  template: `empty`
})
class SiEmptyComponent {}

describe('SiLinkDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        SiLinkActionService,
        provideRouter([]),
        provideMockTranslateServiceBuilder(
          () =>
            ({
              translateAsync: (keys, params) => of(`translated=>${keys}-${JSON.stringify(params)}`)
            }) as SiTranslateService
        )
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('should create an instance with a href', async () => {
    component.link.set({ href: '/test' });
    await fixture.whenStable();

    const anchor = element.querySelector('a')!;
    expect(anchor).toHaveAttribute('href', '/test');
  });

  it('should not add an href attribute on undefined link input', async () => {
    component.link.set(undefined);
    await fixture.whenStable();

    const anchor = element.querySelector<HTMLAnchorElement>('a')!;
    expect(anchor.getAttribute('href')).toBeNull();
  });

  it('should set the title attribute from the tooltip', async () => {
    component.link.set({ tooltip: 'tooltip' });
    await fixture.whenStable();

    const anchor = element.querySelector<HTMLElement>('a')!;
    expect(anchor).toHaveAttribute('title', 'translated=>tooltip-undefined');
  });

  describe('should create link with an action', () => {
    it('and action parameter', async () => {
      let actionParam!: any;
      component.link.set({ action: p => (actionParam = p) });
      await fixture.whenStable();

      const anchor = element.querySelector('a')!;
      expect(anchor).toHaveAttribute('href', '');

      anchor.click();

      expect(actionParam).toEqual({ some: 'thing' });
    });

    it('and without action parameter', async () => {
      let actionParam!: any;
      component.link.set({ action: p => (actionParam = p) });
      component.param.set(undefined);
      await fixture.whenStable();

      const anchor = element.querySelector('a')!;
      expect(anchor).toHaveAttribute('href', '');

      anchor.click();

      expect(actionParam).toBeUndefined();
    });

    it('that emits on the SiLinkActionService', async () => {
      let linkAction!: LinkAction;
      const service = TestBed.inject(SiLinkActionService);
      const sub = service.action$.subscribe(action => {
        linkAction = action;
      });

      const link: Link = { action: 'test' };
      component.link.set(link);
      await fixture.whenStable();

      const anchor = element.querySelector('a')!;
      anchor.click();

      expect(linkAction).toEqual({ link, param: { some: 'thing' } });

      sub.unsubscribe();
    });
  });

  it('updates active class on isActive change', async () => {
    component.link.set({ action: () => {} });
    await fixture.whenStable();

    const anchor = element.querySelector('a')!;
    expect(anchor).not.toHaveClass('active');

    // flip to active
    component.link.set({ action: () => {}, isActive: true });
    await fixture.whenStable();

    expect(anchor).toHaveClass('active');
    expect(component.activeChange).toHaveBeenCalledWith(true);

    // and back again
    component.link.set({ action: () => {}, isActive: false });
    await fixture.whenStable();

    expect(anchor).not.toHaveClass('active');
    expect(component.activeChange).toHaveBeenCalledWith(false);
  });

  describe('router link', () => {
    it('should create an instance with a link', async () => {
      component.link.set({ link: '/test' });
      await fixture.whenStable();

      const anchor = element.querySelector('a')!;
      expect(anchor).toHaveAttribute('href', '/test');
    });

    it('merges query params by default', async () => {
      const router = TestBed.inject(Router);
      router.resetConfig([{ path: 'test', component: SiEmptyComponent }]);
      component.link.set({
        link: '/test2',
        navigationExtras: {
          queryParams: { a: 'b' }
        }
      });
      await fixture.whenStable();

      await router.navigateByUrl('/test?q=123#fragment');
      await fixture.whenStable();

      const anchor = element.querySelector('a')!;
      expect(anchor).toHaveAttribute('href', '/test2?q=123&a=b#fragment');

      // change query params
      await router.navigate([], {
        preserveFragment: true,
        queryParamsHandling: 'merge',
        queryParams: { q: 456 }
      });
      await fixture.whenStable();

      // link needs to reflect the change
      expect(anchor).toHaveAttribute('href', '/test2?q=456&a=b#fragment');
    });

    describe('with SI_LINK_DEFAULT_NAVIGATION_EXTRA', () => {
      beforeEach(async () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          imports: [SiLinkDirective, TestHostComponent],
          providers: [
            SiLinkActionService,
            provideRouter([]),
            {
              provide: SI_LINK_DEFAULT_NAVIGATION_EXTRA,
              useValue: { preserveFragment: false, queryParamsHandling: '' }
            }
          ]
        });

        fixture = TestBed.createComponent(TestHostComponent);
        component = fixture.componentInstance;
        element = fixture.nativeElement;
        await fixture.whenStable();
      });

      it('should allow default navigationExtras overwrites', async () => {
        const router = TestBed.inject(Router);
        router.resetConfig([{ path: 'test', component: SiEmptyComponent }]);
        component.link.set({
          link: '/test2',
          navigationExtras: {
            queryParams: { a: 'b' }
          }
        });

        await fixture.whenStable();
        await router.navigateByUrl('/test?q=123#fragment');
        await fixture.whenStable();

        const anchor = element.querySelector('a')!;
        expect(anchor).toHaveAttribute('href', '/test2?a=b');
      });
    });
  });
});
