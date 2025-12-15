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
  ViewChild
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule, provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, RouterLink, RouterOutlet } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of, Subject } from 'rxjs';

import {
  BOOTSTRAP_BREAKPOINTS,
  ElementDimensions,
  ResizeObserverService
} from '../resize-observer';
import { SiDetailsPaneBodyComponent } from './si-details-pane-body/si-details-pane-body.component';
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
  describe('with plain usage', () => {
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
          },
          provideZonelessChangeDetection()
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(WrapperComponent);
      component = fixture.componentInstance;
      debugElement = fixture.debugElement;
      htmlElement = debugElement.nativeElement;
      fixture.detectChanges();
      resizeObserver.next({ width: 800, height: 500 });
    });

    it('should change listWidth when split sizes change', async () => {
      jasmine.clock().install();
      component.disableResizing = false;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      await fixture.whenStable();
      jasmine.clock().tick(100);
      await fixture.whenStable();
      jasmine.clock().uninstall();
      // drag si-split > .si-split-gutter 25% to the left
      const split = htmlElement.querySelector('si-split')!;
      const splitHandle = split.querySelector('.si-split-gutter') as HTMLElement;
      const splitBox = split.getBoundingClientRect();
      const splitHandleBox = splitHandle.getBoundingClientRect();
      const x = splitBox.x + splitBox.width - splitHandleBox.width / 2;
      const y = splitBox.y + splitBox.height / 2;
      const listWidth = component.listDetails.listWidth();
      drag(splitHandle, x, y, x - 0.25 * splitBox.width, y);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.listDetails.listWidth()).not.toBe(listWidth);
    });

    it('should unset detailsActive when back button is clicked', async () => {
      component.detailsActive = true;
      resizeObserver.next({ width: component.expandBreakpoint - 1, height: 500 });
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      const backButton = htmlElement.querySelector('si-details-pane button')!;
      backButton.dispatchEvent(new Event('click'));
      fixture.detectChanges();
      expect(component.detailsActive).toBeFalse();
    });

    it('should add host .expanded class when crossing expandBreakpoint', () => {
      fixture.detectChanges();
      const hostEl = htmlElement.querySelector('si-list-details')!;
      expect(hostEl.classList).toContain('expanded');
    });

    describe('animation state', () => {
      it('should be "collapsed" when detailsInactive & small', async () => {
        component.detailsActive = false;
        resizeObserver.next({ width: component.expandBreakpoint - 1, height: 500 });
        await fixture.whenStable();
        fixture.detectChanges();
        expect(component.listDetails.detailsExpandedAnimation()).toBe('collapsed');
      });

      it('should be "expanded" when detailsActive & small', async () => {
        component.detailsActive = true;
        resizeObserver.next({ width: component.expandBreakpoint - 1, height: 500 });
        await fixture.whenStable();
        fixture.detectChanges();
        expect(component.listDetails.detailsExpandedAnimation()).toBe('expanded');
      });

      it('should be "disabled" when in large mode regardless of detailsActive', async () => {
        component.detailsActive = true;
        await fixture.whenStable();
        fixture.detectChanges();
        expect(component.listDetails.detailsExpandedAnimation()).toBe('disabled');
      });
    });

    describe('hasLargeSize changes', () => {
      it('should change hasLargeSize to true when crossing above breakpoint', async () => {
        await fixture.whenStable();
        fixture.detectChanges();
        expect(component.listDetails.hasLargeSize()).toBeTrue();
      });

      it('should change hasLargeSize to false when dropping below breakpoint', async () => {
        await fixture.whenStable();
        fixture.detectChanges();
        resizeObserver.next({ width: component.expandBreakpoint - 1, height: 500 });
        await fixture.whenStable();
        fixture.detectChanges();
        expect(component.listDetails.hasLargeSize()).toBeFalse();
      });
    });

    describe('interactivity', () => {
      it('should open details and then go back via the back-button click', async () => {
        resizeObserver.next({ width: component.expandBreakpoint - 1, height: 500 });
        fixture.detectChanges();
        await fixture.whenStable();

        component.detailsActive = true;
        component.cdRef.markForCheck();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(getInViewport(getDetailsPane().firstElementChild as HTMLElement)).toBeTrue();

        const backBtn = htmlElement.querySelector('si-details-pane button')!;
        backBtn.dispatchEvent(new Event('click'));
        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.detailsActive).toBeFalse();
        expect(getInViewport(getListPane().firstElementChild as HTMLElement)).toBeTrue();
      });

      it('should switch between split and static layouts as size & disableResizing change', async () => {
        component.disableResizing = false;
        fixture.detectChanges();
        await fixture.whenStable();
        expect(getSiSplit()).toBeTruthy();
        expect(getListDetails()).toBeFalsy();

        resizeObserver.next({ width: component.expandBreakpoint - 1, height: 500 });
        fixture.detectChanges();
        await fixture.whenStable();
        expect(getSiSplit()).toBeFalsy();
        expect(getListDetails()).toBeTruthy();

        component.disableResizing = true;
        fixture.detectChanges();
        await fixture.whenStable();
        expect(getSiSplit()).toBeFalsy();
        expect(getListDetails()).toBeTruthy();
      });

      it('should keep both panes visible on large screens regardless of detailsActive', async () => {
        fixture.detectChanges();
        await fixture.whenStable();

        component.detailsActive = false;
        fixture.detectChanges();
        await fixture.whenStable();
        expect(getInViewport(getListPane().firstElementChild as HTMLElement)).toBeTrue();
        expect(getInViewport(getDetailsPane().firstElementChild as HTMLElement)).toBeTrue();

        component.detailsActive = true;
        fixture.detectChanges();
        await fixture.whenStable();
        expect(getInViewport(getListPane().firstElementChild as HTMLElement)).toBeTrue();
        expect(getInViewport(getDetailsPane().firstElementChild as HTMLElement)).toBeTrue();
      });
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

      it('should only have the list pane in view on small screens when details are inactive', async () => {
        resizeObserver.next({ width: component.expandBreakpoint - 1, height: 500 });
        component.detailsActive = false;
        fixture.detectChanges();
        await fixture.whenStable();
        expect(getInViewport(getDetailsPane().firstElementChild as HTMLElement)).toBeFalse();
      });

      it('should set inert attribute to prevent focus on hidden details when details are inactive on small screens', async () => {
        resizeObserver.next({ width: component.expandBreakpoint - 1, height: 500 });
        component.detailsActive = false;
        fixture.detectChanges();
        await fixture.whenStable();
        expect(debugElement.query(By.css('si-details-pane[inert]'))).toBeTruthy();
      });

      it('should not set inert attribute when details are active on small screens', async () => {
        resizeObserver.next({ width: component.expandBreakpoint - 1, height: 500 });
        component.detailsActive = true;
        fixture.detectChanges();
        await fixture.whenStable();
        expect(debugElement.query(By.css('si-details-pane:not([inert])'))).toBeTruthy();
      });

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

      it('should only have the details pane in view on small screens when details are active', async () => {
        resizeObserver.next({ width: component.expandBreakpoint - 1, height: 500 });
        component.detailsActive = true;
        fixture.detectChanges();
        await fixture.whenStable();
        expect(getInViewport(getListPane().firstElementChild as HTMLElement)).toBeFalse();
      });
    });
  });

  describe('with router-based details', () => {
    @Component({
      imports: [SiDetailsPaneBodyComponent, SiDetailsPaneHeaderComponent],
      template: `
        <si-details-pane-header>Header</si-details-pane-header>
        <si-details-pane-body>Body</si-details-pane-body>
      `
    })
    class DetailsComponent {}

    @Component({ selector: 'si-empty', template: 'EMPTY' })
    class EmptyComponent {}

    @Component({
      imports: [
        SiListDetailsComponent,
        SiListPaneComponent,
        RouterLink,
        RouterOutlet,
        SiDetailsPaneComponent
      ],
      template: `
        <si-list-details>
          <si-list-pane />
          <si-details-pane>
            <router-outlet />
          </si-details-pane>
        </si-list-details>
      `
    })
    class ListComponent {}

    let routerHarness: RouterTestingHarness;
    let debugElement: DebugElement;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideNoopAnimations(),
          provideRouter([
            {
              path: 'list',
              component: ListComponent,
              children: [
                {
                  path: '',
                  component: EmptyComponent,
                  pathMatch: 'full',
                  data: { SI_EMPTY_DETAILS: true }
                },
                {
                  path: 'details',
                  component: DetailsComponent
                }
              ]
            }
          ]),
          provideZonelessChangeDetection()
        ]
      });
    });

    beforeEach(() => {
      jasmine.clock().install();
      jasmine.clock().mockDate();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should navigate back and forward in mobile mode by clicking', async () => {
      spyOn(ResizeObserverService.prototype, 'observe').and.returnValue(
        of({ width: 100, height: 100 })
      );
      routerHarness = await RouterTestingHarness.create('/list');
      debugElement = routerHarness.fixture.debugElement;
      routerHarness.detectChanges();
      // Also technical visible in mobile mode
      expect(debugElement.query(By.css('si-empty'))).toBeTruthy();
      expect(debugElement.query(By.css('.list-details')).classes['details-active']).toBeFalsy();
      await routerHarness.navigateByUrl('/list/details');
      routerHarness.detectChanges();
      expect(debugElement.query(By.css('si-details-pane-body'))).toBeTruthy();
      expect(debugElement.query(By.css('.list-details')).classes['details-active']).toBeTrue();
      debugElement.query(By.css('.si-details-header-back')).nativeElement.click();
      routerHarness.detectChanges();
      await routerHarness.fixture.whenStable();
      jasmine.clock().tick(10);
      await routerHarness.fixture.whenStable();
      expect(debugElement.query(By.css('si-empty'))).toBeTruthy();
      expect(debugElement.query(By.css('.list-details')).classes['details-active']).toBeFalsy();
    });

    it('should navigate back and forward in mobile mode by navigation', async () => {
      spyOn(ResizeObserverService.prototype, 'observe').and.returnValue(
        of({ width: 100, height: 100 })
      );
      routerHarness = await RouterTestingHarness.create('/list');
      debugElement = routerHarness.fixture.debugElement;
      routerHarness.detectChanges();
      // Also technical visible in mobile mode
      expect(debugElement.query(By.css('si-empty'))).toBeTruthy();
      expect(debugElement.query(By.css('.list-details')).classes['details-active']).toBeFalsy();
      await routerHarness.navigateByUrl('/list/details');
      routerHarness.detectChanges();
      expect(debugElement.query(By.css('si-details-pane-body'))).toBeTruthy();
      expect(debugElement.query(By.css('.list-details')).classes['details-active']).toBeTrue();
      await routerHarness.navigateByUrl('/list');
      routerHarness.detectChanges();
      await routerHarness.fixture.whenStable();
      expect(debugElement.query(By.css('si-empty'))).toBeTruthy();
      expect(debugElement.query(By.css('.list-details')).classes['details-active']).toBeFalsy();
    });
  });
});
