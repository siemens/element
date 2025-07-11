/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DebugElement,
  inject,
  ViewChild
} from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';

import {
  BOOTSTRAP_BREAKPOINTS,
  ElementDimensions,
  ResizeObserverService
} from '../resize-observer';
import { SiDetailsPaneFooterComponent } from './si-details-pane-footer/si-details-pane-footer.component';
import { SiDetailsPaneHeaderComponent } from './si-details-pane-header/si-details-pane-header.component';
import { SiDetailsPaneComponent } from './si-details-pane/si-details-pane.component';
import { SiListDetailsComponent } from './si-list-details.component';
import { SiListPaneHeaderComponent } from './si-list-pane-header/si-list-pane-header.component';
import { SiListPaneComponent } from './si-list-pane/si-list-pane.component';

@Component({
  imports: [
    SiListDetailsComponent,
    SiListPaneComponent,
    SiDetailsPaneComponent,
    SiListPaneHeaderComponent,
    SiDetailsPaneHeaderComponent,
    SiDetailsPaneFooterComponent
  ],
  template: `
    <si-list-details
      class="vh-100"
      stateId="si-list-details-1"
      [expandBreakpoint]="expandBreakpoint"
      [disableResizing]="disableResizing"
      [(detailsActive)]="detailsActive"
    >
      <si-list-pane>
        <si-list-pane-header>
          <span>search</span>
          <span>list-actions</span>
        </si-list-pane-header>
        <span>list-data</span>
      </si-list-pane>
      <si-details-pane>
        <si-details-pane-header [title]="detailsTitle" [hideBackButton]="hideBackButton">
          <span>details-action</span>
        </si-details-pane-header>
        <span>details</span>
        <si-details-pane-footer>
          <span>details-buttons</span>
        </si-details-pane-footer>
      </si-details-pane>
    </si-list-details>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class WrapperComponent {
  @ViewChild(SiListDetailsComponent, { static: true })
  listDetails!: SiListDetailsComponent;
  detailsTitle = 'details-title';
  hideBackButton = false;
  disableResizing = true;
  expandBreakpoint = BOOTSTRAP_BREAKPOINTS.mdMinimum;
  detailsActive = false;
  cdRef = inject(ChangeDetectorRef);
}

describe('ListDetailsComponent', () => {
  let component: WrapperComponent;
  let fixture: ComponentFixture<WrapperComponent>;
  let debugElement: DebugElement;
  let htmlElement: HTMLElement;

  const getSiSplit = (): HTMLElement => htmlElement.querySelector('si-split') as HTMLElement;
  const getListDetails = (): HTMLElement =>
    htmlElement.querySelector('.list-details') as HTMLElement;
  const getListPane = (): HTMLElement => htmlElement.querySelector('si-list-pane') as HTMLElement;
  const getDetailsPane = (): HTMLElement =>
    htmlElement.querySelector('si-details-pane') as HTMLElement;
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
  const drag = (
    dispatchElement: HTMLElement,
    xStart: number,
    yStart: number,
    xEnd: number,
    yEnd: number,
    duration = 3000,
    durationBetweenSteps = 100
  ): void => {
    dispatchElement.dispatchEvent(
      new MouseEvent('mousedown', {
        bubbles: true,
        clientX: xStart,
        clientY: yStart,
        relatedTarget: dispatchElement
      })
    );
    fixture.detectChanges();

    const steps = duration / durationBetweenSteps;
    const xDiff = xEnd - xStart;
    const xStep = xDiff / steps;
    const yDiff = yEnd - yStart;
    const yStep = yDiff / steps;
    let currentX = xStart;
    let currentY = yStart;
    for (let i = 0; i < steps; i++) {
      currentX += xStep;
      currentY += yStep;
      dispatchElement.dispatchEvent(
        new MouseEvent('mousemove', {
          bubbles: true,
          clientX: currentX,
          clientY: currentY,
          movementX: xStep,
          movementY: yStep,
          relatedTarget: dispatchElement
        })
      );
    }

    dispatchElement.dispatchEvent(
      new MouseEvent('mouseup', {
        bubbles: true,
        clientX: xEnd,
        clientY: yEnd,
        relatedTarget: dispatchElement
      })
    );
    fixture.detectChanges();
  };

  const resizeObserver = new Subject<ElementDimensions>();
  const resizeSpy = jasmine.createSpyObj('ResizeObserverService', ['observe']);

  beforeEach(async () => {
    resizeSpy.observe.and.callFake((e: Element, t: number, i: boolean, im?: boolean) => {
      return resizeObserver;
    });

    await TestBed.configureTestingModule({
      imports: [WrapperComponent, NoopAnimationsModule],
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
    resizeObserver.next({ width: 800, height: 500 });
  });

  it('should change listWidth when split sizes change', fakeAsync(() => {
    component.disableResizing = false;
    fixture.detectChanges();
    flush();
    fixture.detectChanges();
    // drag si-split > .si-split-gutter 25% to the left
    const split = htmlElement.querySelector('si-split')!;
    const splitHandle = split.querySelector('.si-split-gutter') as HTMLElement;
    const splitBox = split.getBoundingClientRect();
    const splitHandleBox = splitHandle.getBoundingClientRect();
    const x = splitBox.x + splitBox.width - splitHandleBox.width / 2;
    const y = splitBox.y + splitBox.height / 2;
    expect(component.listDetails.listWidth()).toBe('default');
    drag(splitHandle, x, y, x - 0.25 * splitBox.width, y);
    fixture.detectChanges();
    flush();
    fixture.detectChanges();
    expect(component.listDetails.listWidth()).not.toBe('default');
  }));

  it('should unset detailsActive when back button is clicked', fakeAsync(() => {
    component.detailsActive = true;
    resizeObserver.next({ width: component.expandBreakpoint - 1, height: 500 });
    fixture.detectChanges();
    flush();
    fixture.detectChanges();
    const backButton = htmlElement.querySelector('si-details-pane button')!;
    backButton.dispatchEvent(new Event('click'));
    fixture.detectChanges();
    expect(component.detailsActive).toBeFalse();
  }));

  it('should add host .expanded class when crossing expandBreakpoint', () => {
    fixture.detectChanges();
    const hostEl = htmlElement.querySelector('si-list-details')!;
    expect(hostEl.classList).toContain('expanded');
  });

  describe('animation state', () => {
    it('should be "collapsed" when detailsInactive & small', fakeAsync(() => {
      component.detailsActive = false;
      resizeObserver.next({ width: component.expandBreakpoint - 1, height: 500 });
      flush();
      fixture.detectChanges();
      expect(component.listDetails.detailsExpandedAnimation()).toBe('collapsed');
    }));

    it('should be "expanded" when detailsActive & small', fakeAsync(() => {
      component.detailsActive = true;
      resizeObserver.next({ width: component.expandBreakpoint - 1, height: 500 });
      flush();
      fixture.detectChanges();
      expect(component.listDetails.detailsExpandedAnimation()).toBe('expanded');
    }));

    it('should be "disabled" when in large mode regardless of detailsActive', fakeAsync(() => {
      component.detailsActive = true;
      flush();
      fixture.detectChanges();
      expect(component.listDetails.detailsExpandedAnimation()).toBe('disabled');
    }));
  });

  describe('hasLargeSize changes', () => {
    it('should change hasLargeSize to true when crossing above breakpoint', fakeAsync(() => {
      flush();
      fixture.detectChanges();
      expect(component.listDetails.hasLargeSize()).toBeTrue();
    }));

    it('should change hasLargeSize to false when dropping below breakpoint', fakeAsync(() => {
      flush();
      fixture.detectChanges();
      resizeObserver.next({ width: component.expandBreakpoint - 1, height: 500 });
      flush();
      fixture.detectChanges();
      expect(component.listDetails.hasLargeSize()).toBeFalse();
    }));
  });

  describe('interactivity', () => {
    it('should open details and then go back via the back-button click', fakeAsync(() => {
      resizeObserver.next({ width: component.expandBreakpoint - 1, height: 500 });
      fixture.detectChanges();
      flush();

      component.detailsActive = true;
      component.cdRef.markForCheck();
      fixture.detectChanges();
      flush();
      fixture.detectChanges();

      expect(getInViewport(getDetailsPane().firstElementChild as HTMLElement)).toBeTrue();

      const backBtn = htmlElement.querySelector('si-details-pane button')!;
      backBtn.dispatchEvent(new Event('click'));
      fixture.detectChanges();
      flush();

      expect(component.detailsActive).toBeFalse();
      expect(getInViewport(getListPane().firstElementChild as HTMLElement)).toBeTrue();
    }));

    it('should switch between split and static layouts as size & disableResizing change', fakeAsync(() => {
      component.disableResizing = false;
      fixture.detectChanges();
      flush();
      expect(getSiSplit()).toBeTruthy();
      expect(getListDetails()).toBeFalsy();

      resizeObserver.next({ width: component.expandBreakpoint - 1, height: 500 });
      fixture.detectChanges();
      flush();
      expect(getSiSplit()).toBeFalsy();
      expect(getListDetails()).toBeTruthy();

      component.disableResizing = true;
      fixture.detectChanges();
      flush();
      expect(getSiSplit()).toBeFalsy();
      expect(getListDetails()).toBeTruthy();
    }));

    it('should keep both panes visible on large screens regardless of detailsActive', fakeAsync(() => {
      fixture.detectChanges();
      flush();

      component.detailsActive = false;
      fixture.detectChanges();
      flush();
      expect(getInViewport(getListPane().firstElementChild as HTMLElement)).toBeTrue();
      expect(getInViewport(getDetailsPane().firstElementChild as HTMLElement)).toBeTrue();

      component.detailsActive = true;
      fixture.detectChanges();
      flush();
      expect(getInViewport(getListPane().firstElementChild as HTMLElement)).toBeTrue();
      expect(getInViewport(getDetailsPane().firstElementChild as HTMLElement)).toBeTrue();
    }));
  });

  describe('responsive behaviour', () => {
    it('should show a si-split container when parts are resizable and container has large size', () => {
      component.disableResizing = false;
      fixture.detectChanges();
      expect(getSiSplit()).toBeTruthy();
      expect(getListDetails()).toBeFalsy();
    });

    it('should show a non-resizable div container when parts are not resizable or container does not have large size', () => {
      resizeObserver.next({ width: component.expandBreakpoint - 1, height: 500 });
      component.disableResizing = false;
      fixture.detectChanges();
      expect(getSiSplit()).toBeFalsy();
      expect(getListDetails()).toBeTruthy();

      resizeObserver.next({ width: component.expandBreakpoint + 1, height: 500 });
      component.disableResizing = true;
      fixture.detectChanges();
      expect(getSiSplit()).toBeFalsy();
      expect(getListDetails()).toBeTruthy();

      resizeObserver.next({ width: component.expandBreakpoint - 1, height: 500 });
      component.disableResizing = true;
      fixture.detectChanges();
      expect(getSiSplit()).toBeFalsy();
      expect(getListDetails()).toBeTruthy();
    });

    it('should only have the list pane in view on small screens when details are inactive', fakeAsync(() => {
      resizeObserver.next({ width: component.expandBreakpoint - 1, height: 500 });
      component.detailsActive = false;
      fixture.detectChanges();
      flush();
      expect(getInViewport(getDetailsPane().firstElementChild as HTMLElement)).toBeFalse();
    }));

    it('should set inert attribute to prevent focus on hidden details when details are inactive on small screens', fakeAsync(() => {
      resizeObserver.next({ width: component.expandBreakpoint - 1, height: 500 });
      component.detailsActive = false;
      fixture.detectChanges();
      flush();
      expect(debugElement.query(By.css('si-details-pane[inert]'))).toBeTruthy();
    }));

    it('should not set inert attribute when details are active on small screens', fakeAsync(() => {
      resizeObserver.next({ width: component.expandBreakpoint - 1, height: 500 });
      component.detailsActive = true;
      fixture.detectChanges();
      flush();
      expect(debugElement.query(By.css('si-details-pane:not([inert])'))).toBeTruthy();
    }));

    it('should unset detailsActive when details back button was clicked on small screens', () => {
      resizeObserver.next({ width: component.expandBreakpoint - 1, height: 500 });
      component.detailsActive = true;
      fixture.detectChanges();
      htmlElement.querySelector('button')?.click();
      fixture.detectChanges();
      expect(component.detailsActive).toBeFalse();
    });

    it('should not show details back button when hideBackButton is true', () => {
      resizeObserver.next({ width: component.expandBreakpoint - 1, height: 500 });
      component.hideBackButton = true;
      fixture.detectChanges();
      expect(htmlElement.querySelector('button')).toBeFalsy();
    });

    it('should only have the details pane in view on small screens when details are active', fakeAsync(() => {
      resizeObserver.next({ width: component.expandBreakpoint - 1, height: 500 });
      component.detailsActive = true;
      fixture.detectChanges();
      flush();
      expect(getInViewport(getListPane().firstElementChild as HTMLElement)).toBeFalse();
    }));
  });
});
