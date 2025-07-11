/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { runOnPushChangeDetection } from '@siemens/element-ng/test-helpers';
import {
  provideMockTranslateServiceBuilder,
  SiTranslateModule,
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
    [siLink]="link"
    [actionParam]="param"
    (activeChange)="activeChange($event)"
  >
    Testli
  </a>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
  link?: Link = {};
  param? = { some: 'thing' };
  activeChange = (active: boolean): void => {};
  cdRef = inject(ChangeDetectorRef);
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

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SiTranslateModule, SiLinkDirective, TestHostComponent],
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
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create an instance with a href', () => {
    component.link = { href: '/test' };
    component.cdRef.markForCheck();
    fixture.detectChanges();

    const anchor = element.querySelector('a')!;
    expect(anchor.getAttribute('href')).toEqual('/test');
  });

  it('should not add an href attribute on undefined link input', () => {
    component.link = undefined;
    component.cdRef.markForCheck();
    fixture.detectChanges();

    const anchor = element.querySelector<HTMLElement>('a')!;
    expect(anchor.getAttribute('href')).toBeNull();
  });

  it('should set the title attribute from the tooltip', () => {
    component.link = { tooltip: 'tooltip' };
    component.cdRef.markForCheck();
    fixture.detectChanges();

    const anchor = element.querySelector<HTMLElement>('a')!;
    expect(anchor.getAttribute('title')).toBe('translated=>tooltip-undefined');
  });

  describe('should create link with an action', () => {
    it('and action parameter', () => {
      let actionParam!: any;
      component.link = { action: p => (actionParam = p) };
      component.cdRef.markForCheck();
      fixture.detectChanges();

      const anchor = element.querySelector('a')!;
      expect(anchor.getAttribute('href')).toEqual('');

      anchor.click();

      expect(actionParam).toEqual({ some: 'thing' });
    });

    it('and without action parameter', () => {
      let actionParam!: any;
      component.link = { action: p => (actionParam = p) };
      component.param = undefined;
      component.cdRef.markForCheck();
      fixture.detectChanges();

      const anchor = element.querySelector('a')!;
      expect(anchor.getAttribute('href')).toEqual('');

      anchor.click();

      expect(actionParam).toBeUndefined();
    });

    it('that emits on the SiLinkActionService', () => {
      let linkAction!: LinkAction;
      const service = TestBed.inject(SiLinkActionService);
      const sub = service.action$.subscribe(action => {
        linkAction = action;
      });

      component.link = { action: 'test' };
      component.cdRef.markForCheck();
      fixture.detectChanges();

      const anchor = element.querySelector('a')!;
      anchor.click();

      expect(linkAction).toEqual({ link: component.link, param: { some: 'thing' } });

      sub.unsubscribe();
    });
  });

  it('updates active class on isActive change', fakeAsync(() => {
    const changeSpy = spyOn(component, 'activeChange');
    component.link = { action: () => {} };
    component.cdRef.markForCheck();
    fixture.detectChanges();
    tick();

    const anchor = element.querySelector('a')!;
    expect(anchor.classList).not.toContain('active');

    // flip to active
    component.link.isActive = true;
    component.cdRef.markForCheck();
    fixture.detectChanges();
    tick();

    expect(anchor.classList).toContain('active');
    expect(changeSpy).toHaveBeenCalledWith(true);

    // and back again
    component.link.isActive = false;
    component.cdRef.markForCheck();
    fixture.detectChanges();
    tick();

    expect(anchor.classList).not.toContain('active');
    expect(changeSpy).toHaveBeenCalledWith(false);
  }));

  describe('router link', () => {
    it('should create an instance with a link', async () => {
      component.link = { link: '/test' };
      await runOnPushChangeDetection(fixture);
      fixture.detectChanges();

      const anchor = element.querySelector('a')!;
      expect(anchor.getAttribute('href')).toEqual('/test');
    });

    it('merges query params by default', async () => {
      const router = TestBed.inject(Router);
      router.resetConfig([{ path: 'test', component: SiEmptyComponent }]);
      component.link = {
        link: '/test2',
        navigationExtras: {
          queryParams: { a: 'b' }
        }
      };
      await runOnPushChangeDetection(fixture);

      await router.navigateByUrl('/test?q=123#fragment');
      fixture.detectChanges();

      const anchor = element.querySelector('a')!;
      expect(anchor.getAttribute('href')).toEqual('/test2?q=123&a=b#fragment');

      // change query params
      await router.navigate([], {
        preserveFragment: true,
        queryParamsHandling: 'merge',
        queryParams: { q: 456 }
      });
      fixture.detectChanges();

      // link needs to reflect the change
      expect(anchor.getAttribute('href')).toEqual('/test2?q=456&a=b#fragment');
    });

    describe('with SI_LINK_DEFAULT_NAVIGATION_EXTRA', () => {
      beforeEach(() => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          imports: [SiTranslateModule, SiLinkDirective, TestHostComponent],
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
        fixture.detectChanges();
      });

      it('should allow default navigationExtras overwrites', async () => {
        const router = TestBed.inject(Router);
        router.resetConfig([{ path: 'test', component: SiEmptyComponent }]);
        component.link = {
          link: '/test2',
          navigationExtras: {
            queryParams: { a: 'b' }
          }
        };

        await runOnPushChangeDetection(fixture);
        await router.navigateByUrl('/test?q=123#fragment');
        fixture.detectChanges();

        const anchor = element.querySelector('a')!;
        expect(anchor.getAttribute('href')).toEqual('/test2?a=b');
      });
    });
  });
});
