/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DebugElement,
  inject,
  provideZonelessChangeDetection,
  viewChild
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

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
      [heading]="heading"
      [truncateHeading]="truncateHeading"
      [detailsHeading]="detailsHeading"
      [hideBackButton]="hideBackButton"
      [largeLayoutBreakpoint]="largeLayoutBreakpoint"
      [resizableParts]="resizableParts"
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

  heading = 'heading';
  truncateHeading = false;
  detailsHeading = 'details-heading';
  hideBackButton = false;
  resizableParts = false;
  largeLayoutBreakpoint = BOOTSTRAP_BREAKPOINTS.mdMinimum;
  detailsActive = false;
  cdRef = inject(ChangeDetectorRef);
  hasLargeSizeChanged(e: boolean): void {}
  mainContainerWidthChanged(w: number): void {}
}

describe('MainDetailContainerComponent', () => {
  let component: WrapperComponent;
  let fixture: ComponentFixture<WrapperComponent>;
  let debugElement: DebugElement;
  let htmlElement: HTMLElement;

  let doAnimationSpy: Mock<any>;
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
    resizeSpy.observe.mockImplementation((e: Element, t: number, i: boolean, im?: boolean) => {
      return resizeObserver;
    });

    await TestBed.configureTestingModule({
      imports: [WrapperComponent],
      providers: [
        {
          provide: ResizeObserverService,
          useValue: resizeSpy
        },
        provideZonelessChangeDetection()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WrapperComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    htmlElement = debugElement.nativeElement;
    fixture.detectChanges();
    doAnimationSpy = vi.spyOn<any, any>(component.mainDetail(), 'doAnimation');
    resizeObserver.next({ width: 800, height: 500 });

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not contain si-split when #resizableParts is false', () => {
    expect(htmlElement.querySelector('si-split')).toBeFalsy();
  });

  it('should contain si-split when #resizableParts is true', () => {
    component.resizableParts = true;
    fixture.detectChanges();

    expect(htmlElement.querySelector('si-split')).toBeTruthy();
    expect(htmlElement.querySelectorAll('si-split-part')).toHaveLength(2);
  });

  it('should hide the heading component when heading input text is empty', () => {
    component.heading = '';
    fixture.detectChanges();

    expect(htmlElement.querySelector('.si-layout-header')).toBeFalsy();
  });

  it('should add text-truncate class to header when setting #truncateHeading', () => {
    component.truncateHeading = true;
    fixture.detectChanges();

    expect(htmlElement.querySelector('.si-layout-title')?.classList).toContain('text-truncate');
  });

  it('should remove details heading component when #detailsHeading is empty', () => {
    component.detailsHeading = '';
    fixture.detectChanges();

    expect(htmlElement.querySelector('.detail-heading')).toBeFalsy();
  });

  describe('toggling the detailsActive state', () => {
    beforeEach(() => {
      component.detailsActive = false;
      fixture.detectChanges();
    });

    it('should apply a class indicating to animate the view change', () => {
      // prepare
      component.detailsActive = true;
      component.cdRef.markForCheck();
      // act
      fixture.detectChanges();
      // expect
      expect(doAnimationSpy).toHaveBeenCalledWith(true);
      expect(htmlElement.querySelector('si-main-detail-container')?.classList).toContain('animate');
    });

    it('should remove a class indicating to animate the view change after a timeout', () => {
      // prepare
      component.detailsActive = true;
      component.cdRef.markForCheck();
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
    it('should show a si-split container when container parts should be resizable and when the container has large size', () => {
      // prepare
      resizeObserver.next({ width: component.largeLayoutBreakpoint, height: 500 });
      component.resizableParts = true;
      // act
      fixture.detectChanges();
      // expect
      expect(getSiSplit()).toBeTruthy();
      expect(getMainDetailContainer()).toBeFalsy();
    });

    it('should show a non-resizable div container when container parts should not be resizable or when the container does not have large size', () => {
      // prepare
      resizeObserver.next({ width: component.largeLayoutBreakpoint - 1, height: 500 });
      component.resizableParts = true;
      // act
      fixture.detectChanges();
      // expect
      expect(getSiSplit()).toBeFalsy();
      expect(getMainDetailContainer()).toBeTruthy();

      // prepare
      resizeObserver.next({ width: component.largeLayoutBreakpoint, height: 500 });
      component.resizableParts = false;
      // act
      fixture.detectChanges();
      // expect
      expect(getSiSplit()).toBeFalsy();
      expect(getMainDetailContainer()).toBeTruthy();

      // prepare
      resizeObserver.next({ width: component.largeLayoutBreakpoint - 1, height: 500 });
      component.resizableParts = false;
      // act
      fixture.detectChanges();
      // expect
      expect(getSiSplit()).toBeFalsy();
      expect(getMainDetailContainer()).toBeTruthy();
    });

    it('should only have the main pane in view on small screens when details are inactive', () => {
      // prepare
      resizeObserver.next({ width: component.largeLayoutBreakpoint - 1, height: 500 });
      component.detailsActive = false;
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
      component.detailsActive = false;
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
      component.detailsActive = true;
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

    it('should unset detailsActive when detail back button was clicked', () => {
      // prepare
      component.detailsActive = true;
      fixture.detectChanges();
      // act
      htmlElement.querySelector('button')?.click();
      fixture.detectChanges();
      // expect
      expect(component.detailsActive).toBe(false);
    });

    it('should not show details back button', () => {
      component.hideBackButton = true;
      fixture.detectChanges();

      expect(htmlElement.querySelector('button')).toBeFalsy();
    });

    it('should only have the detail pane in view on small screens when details are active', () => {
      // prepare
      component.detailsActive = true;
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
