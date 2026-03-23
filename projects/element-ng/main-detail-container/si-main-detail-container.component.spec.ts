/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DebugElement,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { type Mock } from 'vitest';

import {
  BOOTSTRAP_BREAKPOINTS,
  ElementDimensions,
  ResizeObserverService
} from '../resize-observer';
import { SiMainDetailContainerComponent } from './si-main-detail-container.component';

@Component({
  imports: [SiMainDetailContainerComponent],
  template: `
    <si-main-detail-container
      class="vh-100"
      stateId="si-main-detail-container-1"
      [heading]="heading()"
      [truncateHeading]="truncateHeading()"
      [detailsHeading]="detailsHeading()"
      [hideBackButton]="hideBackButton()"
      [largeLayoutBreakpoint]="largeLayoutBreakpoint"
      [resizableParts]="resizableParts()"
      [(detailsActive)]="detailsActive"
      (hasLargeSizeChange)="hasLargeSizeChanged($event)"
      (mainContainerWidthChange)="mainContainerWidthChanged($event)"
    >
      <span slot="mainSearch">search</span>
      <span slot="mainActions">main-actions</span>
      <span slot="mainData">main-data</span>
      <span slot="detailActions">detail-action</span>
      <span slot="details">details</span>
    </si-main-detail-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class WrapperComponent {
  readonly mainDetail = viewChild.required(SiMainDetailContainerComponent);

  readonly heading = signal('heading');
  readonly truncateHeading = signal(false);
  readonly detailsHeading = signal('details-heading');
  readonly hideBackButton = signal(false);
  readonly resizableParts = signal(false);
  largeLayoutBreakpoint = BOOTSTRAP_BREAKPOINTS.mdMinimum;
  readonly detailsActive = signal(false);
  cdRef = inject(ChangeDetectorRef);
  hasLargeSizeChanged(e: boolean): void {}
  mainContainerWidthChanged(w: number | 'default'): void {}
}

describe('MainDetailContainerComponent', () => {
  let component: WrapperComponent;
  let fixture: ComponentFixture<WrapperComponent>;
  let debugElement: DebugElement;
  let htmlElement: HTMLElement;

  let doAnimationSpy: Mock;
  const getSiSplit = (): HTMLElement => htmlElement.querySelector('si-split') as HTMLElement;
  const getMainDetailContainer = (): HTMLElement =>
    htmlElement.querySelector('.main-detail-container') as HTMLElement;
  const getMainContainer = (): HTMLElement =>
    htmlElement.querySelector('.main-container') as HTMLElement;
  const getDetailContainer = (): HTMLElement =>
    htmlElement.querySelector('.detail-container') as HTMLElement;
  const getInViewport = (elem: HTMLElement): boolean => {
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const bounding = elem.getBoundingClientRect();
    return (
      bounding.top >= 0 &&
      bounding.left >= 0 &&
      bounding.bottom <= viewportHeight &&
      bounding.right <= viewportWidth
    );
  };

  const animationDurationMilliseconds = 500;
  const resizeObserver = new Subject<ElementDimensions>();
  const resizeSpy = {
    observe: vi.fn()
  };

  beforeEach(async () => {
    resizeSpy.observe.mockReturnValue(resizeObserver);

    await TestBed.configureTestingModule({
      imports: [WrapperComponent],
      providers: [
        {
          provide: ResizeObserverService,
          useValue: resizeSpy
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WrapperComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    htmlElement = debugElement.nativeElement;
    fixture.detectChanges();
    // @ts-expect-error accessing private method for testing purposes
    doAnimationSpy = vi.spyOn(component.mainDetail(), 'doAnimation');
    resizeObserver.next({ width: 800, height: 500 });

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not contain si-split when #resizableParts is false', () => {
    expect(htmlElement.querySelector('si-split')).toBeFalsy();
  });

  it('should contain si-split when #resizableParts is true', async () => {
    component.resizableParts.set(true);
    await fixture.whenStable();

    expect(htmlElement.querySelector('si-split')).toBeTruthy();
    expect(htmlElement.querySelectorAll('si-split-part')).toHaveLength(2);
  });

  it('should hide the heading component when heading input text is empty', async () => {
    component.heading.set('');
    await fixture.whenStable();

    expect(htmlElement.querySelector('.si-layout-header')).toBeFalsy();
  });

  it('should add text-truncate class to header when setting #truncateHeading', async () => {
    component.truncateHeading.set(true);
    await fixture.whenStable();

    expect(htmlElement.querySelector('.si-layout-title')?.classList).toContain('text-truncate');
  });

  it('should remove details heading component when #detailsHeading is empty', async () => {
    component.detailsHeading.set('');
    await fixture.whenStable();

    expect(htmlElement.querySelector('.detail-heading')).toBeFalsy();
  });

  describe('toggling the detailsActive state', () => {
    beforeEach(async () => {
      component.detailsActive.set(false);
      await fixture.whenStable();
    });

    it('should apply a class indicating to animate the view change', async () => {
      // prepare
      component.detailsActive.set(true);
      // act
      fixture.detectChanges();
      // expect
      expect(doAnimationSpy).toHaveBeenCalledWith(true);
      expect(htmlElement.querySelector('si-main-detail-container')?.classList).toContain('animate');
    });

    it('should remove a class indicating to animate the view change after a timeout', () => {
      // prepare
      component.detailsActive.set(true);
      fixture.detectChanges();
      // act
      vi.advanceTimersByTime(animationDurationMilliseconds);
      fixture.detectChanges();
      // flush timeout
      vi.advanceTimersByTime(0);
      fixture.detectChanges();
      // expect
      expect(doAnimationSpy).toHaveBeenCalledWith(true);
      expect(htmlElement.querySelector('si-main-detail-container')?.classList).not.toContain(
        'animate'
      );
      expect(htmlElement.classList.contains('animate')).toBe(false);
    });
  });

  describe('responsive behaviour', () => {
    it('should show a si-split container when container parts should be resizable and when the container has large size', async () => {
      // prepare
      resizeObserver.next({ width: component.largeLayoutBreakpoint, height: 500 });
      component.resizableParts.set(true);
      // act
      await fixture.whenStable();
      // expect
      expect(getSiSplit()).toBeTruthy();
      expect(getMainDetailContainer()).toBeFalsy();
    });

    it('should show a non-resizable div container when container parts should not be resizable or when the container does not have large size', () => {
      // prepare
      resizeObserver.next({ width: component.largeLayoutBreakpoint - 1, height: 500 });
      component.resizableParts.set(true);
      // act
      fixture.detectChanges();
      // expect
      expect(getSiSplit()).toBeFalsy();
      expect(getMainDetailContainer()).toBeTruthy();

      // prepare
      resizeObserver.next({ width: component.largeLayoutBreakpoint, height: 500 });
      component.resizableParts.set(false);
      // act
      fixture.detectChanges();
      // expect
      expect(getSiSplit()).toBeFalsy();
      expect(getMainDetailContainer()).toBeTruthy();

      // prepare
      resizeObserver.next({ width: component.largeLayoutBreakpoint - 1, height: 500 });
      component.resizableParts.set(false);
      // act
      fixture.detectChanges();
      // expect
      expect(getSiSplit()).toBeFalsy();
      expect(getMainDetailContainer()).toBeTruthy();
    });

    it('should only have the main pane in view on small screens when details are inactive', () => {
      // prepare
      resizeObserver.next({ width: component.largeLayoutBreakpoint - 1, height: 500 });
      component.detailsActive.set(false);
      // act
      vi.advanceTimersByTime(animationDurationMilliseconds);
      fixture.detectChanges();
      const detailContainer = getDetailContainer();
      // flush timeout
      vi.advanceTimersByTime(0);
      fixture.detectChanges();
      // expect
      expect(getInViewport(detailContainer)).toBe(false);
    });

    it('should set inert attribute to prevent focus hidden details when details are inactive', () => {
      // prepare
      resizeObserver.next({ width: component.largeLayoutBreakpoint - 1, height: 500 });
      component.detailsActive.set(false);
      // act
      vi.advanceTimersByTime(animationDurationMilliseconds);
      fixture.detectChanges();
      // flush timeout
      vi.advanceTimersByTime(0);
      fixture.detectChanges();
      // expect
      expect(debugElement.query(By.css('.detail-container[inert]'))).toBeTruthy();
    });

    it('should not set inert attribute when details are active', () => {
      // prepare
      resizeObserver.next({ width: component.largeLayoutBreakpoint - 1, height: 500 });
      component.detailsActive.set(true);
      // act
      vi.advanceTimersByTime(animationDurationMilliseconds);
      fixture.detectChanges();
      // flush timeout
      vi.advanceTimersByTime(0);
      fixture.detectChanges();
      // expect
      expect(debugElement.query(By.css('.detail-container :not([inert])'))).toBeTruthy();
    });
  });

  describe('not large size', () => {
    beforeEach(() => {
      resizeObserver.next({ width: component.largeLayoutBreakpoint - 1, height: 500 });
    });

    it('should unset detailsActive when detail back button was clicked', async () => {
      // prepare
      component.detailsActive.set(true);
      await fixture.whenStable();
      // act
      htmlElement.querySelector('button')?.click();
      // expect
      expect(component.detailsActive()).toBe(false);
    });

    it('should not show details back button', async () => {
      component.hideBackButton.set(true);
      await fixture.whenStable();

      expect(htmlElement.querySelector('button')).toBeFalsy();
    });

    it('should only have the detail pane in view on small screens when details are active', () => {
      // prepare
      component.detailsActive.set(true);
      // act
      vi.advanceTimersByTime(animationDurationMilliseconds);
      fixture.detectChanges();
      const mainContainer = getMainContainer();
      // flush timeout
      vi.advanceTimersByTime(0);
      fixture.detectChanges();
      // expect
      expect(getInViewport(mainContainer)).toBe(false);
    });
  });
});
