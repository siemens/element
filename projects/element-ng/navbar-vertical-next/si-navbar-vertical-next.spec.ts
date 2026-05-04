/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, Injectable, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  provideSiUiState,
  SI_UI_STATE_SERVICE,
  SiUIStateService,
  UIStateStorage
} from '@siemens/element-ng/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  SiNavbarVerticalNextItemsComponent,
  SiNavbarVerticalNextComponent,
  SiNavbarVerticalNextGroupComponent,
  SiNavbarVerticalNextGroupTriggerDirective,
  SiNavbarVerticalNextItemComponent,
  SiNavbarVerticalNextSearchComponent
} from './index';
import { SiNavbarVerticalNextHarness } from './testing/si-navbar-vertical-next.harness';

@Injectable()
class SynchronousMockStore implements UIStateStorage {
  private store: Record<string, string> = {};
  save(key: string, data: string): void {
    this.store[key] = data;
  }

  load(key: string): string | Promise<string | undefined | null> | null | undefined {
    return this.store[key];
  }
}

@Injectable({ providedIn: 'root' })
class BreakpointObserverMock implements Partial<BreakpointObserver> {
  readonly isSmall = new BehaviorSubject<boolean>(false);

  observe(): Observable<BreakpointState> {
    return this.isSmall.pipe(map(matches => ({ matches, breakpoints: {} })));
  }
}

@Component({ template: '' })
class EmptyComponent {}

@Component({
  imports: [
    RouterLink,
    RouterLinkActive,
    SiNavbarVerticalNextItemsComponent,
    SiNavbarVerticalNextSearchComponent,
    SiNavbarVerticalNextComponent,
    SiNavbarVerticalNextGroupComponent,
    SiNavbarVerticalNextGroupTriggerDirective,
    SiNavbarVerticalNextItemComponent
  ],
  template: `<si-navbar-vertical-next
      [textOnly]="textOnly()"
      [stateId]="stateId"
      [collapsed]="collapsed()"
      [alwaysOpenGroupsInFlyout]="alwaysOpenGroupsInFlyout()"
    >
      <si-navbar-vertical-next-search [debounceTime]="0" (searchChange)="searchEvent($event)" />
      @if (showDeclarativeFlyoutGroup()) {
        <si-navbar-vertical-next-items>
          <button
            type="button"
            si-navbar-vertical-next-item
            [siNavbarVerticalNextGroupTriggerFor]="flyoutGroup"
          >
            item-1
          </button>
        </si-navbar-vertical-next-items>
      }

      @if (showDeclarativeNavigationGroup()) {
        <si-navbar-vertical-next-items>
          <button
            type="button"
            si-navbar-vertical-next-item
            [siNavbarVerticalNextGroupTriggerFor]="navigationGroup"
          >
            item1
          </button>
        </si-navbar-vertical-next-items>
      }

      @if (showDeclarativeStateGroups()) {
        <si-navbar-vertical-next-items>
          <button
            type="button"
            si-navbar-vertical-next-item
            stateId="item1"
            [siNavbarVerticalNextGroupTriggerFor]="stateGroupOne"
          >
            item1
          </button>
          <button
            type="button"
            si-navbar-vertical-next-item
            stateId="item2"
            [siNavbarVerticalNextGroupTriggerFor]="stateGroupTwo"
          >
            item2
          </button>
        </si-navbar-vertical-next-items>
      }
    </si-navbar-vertical-next>

    <ng-template #flyoutGroup>
      <si-navbar-vertical-next-group>
        <a si-navbar-vertical-next-item routerLink="item-1/sub-item-1" routerLinkActive>
          sub-item1
        </a>
      </si-navbar-vertical-next-group>
    </ng-template>

    <ng-template #navigationGroup>
      <si-navbar-vertical-next-group routerLinkActive>
        <a
          si-navbar-vertical-next-item
          routerLink="item-1/sub-item-1"
          routerLinkActive
          [routerLinkActiveOptions]="{ exact: true }"
        >
          sub-item1
        </a>
        <a si-navbar-vertical-next-item routerLink="item-1/sub-item-2" routerLinkActive>
          sub-item2
        </a>
      </si-navbar-vertical-next-group>
    </ng-template>

    <ng-template #stateGroupOne>
      <si-navbar-vertical-next-group>
        <a si-navbar-vertical-next-item routerLink="item-1/sub-item-1" routerLinkActive>
          sub-item1
        </a>
      </si-navbar-vertical-next-group>
    </ng-template>

    <ng-template #stateGroupTwo>
      <si-navbar-vertical-next-group>
        <a si-navbar-vertical-next-item routerLink="item-1/sub-item-2" routerLinkActive>
          sub-item2
        </a>
      </si-navbar-vertical-next-group>
    </ng-template>`
})
class TestHostComponent {
  readonly textOnly = signal(true);
  stateId?: string;
  readonly collapsed = signal(false);
  readonly alwaysOpenGroupsInFlyout = signal(false);
  readonly showDeclarativeFlyoutGroup = signal(false);
  readonly showDeclarativeNavigationGroup = signal(false);
  readonly showDeclarativeStateGroups = signal(false);

  searchEvent(event: string): void {}
}

describe('SiNavbarVerticalNext', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let harnessLoader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiNavbarVerticalNextComponent, TestHostComponent],
      providers: [
        provideSiUiState({ store: SynchronousMockStore }),
        provideRouter([
          {
            path: 'item-1',
            component: EmptyComponent,
            children: [
              { path: 'sub-item-1', component: EmptyComponent },
              { path: 'sub-item-1/sub-path', component: EmptyComponent },
              { path: 'sub-item-2', component: EmptyComponent },
              { path: 'sub-item-2/sub-path', component: EmptyComponent }
            ]
          },
          { path: 'somewhere-else', component: EmptyComponent }
        ]),
        { provide: BreakpointObserver, useExisting: BreakpointObserverMock }
      ]
    }).compileComponents();
  });

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    harnessLoader = TestbedHarnessEnvironment.loader(fixture);
  });

  describe('without SiUIStateService', () => {
    let harness: SiNavbarVerticalNextHarness;
    beforeEach(async () => (harness = await harnessLoader.getHarness(SiNavbarVerticalNextHarness)));

    it('should expand/collapse navbar with click', async () => {
      component.collapsed.set(true);
      expect(await harness.isCollapsed()).toBe(true);
      await harness.toggleCollapse();
      expect(await harness.isExpanded()).toBe(true);
      await harness.toggleCollapse();
      expect(await harness.isCollapsed()).toBe(true);
    });

    it('should expand on search button click with textonly false', async () => {
      component.textOnly.set(false);
      component.collapsed.set(true);
      await harness.clickSearch();
      expect(await harness.isExpanded()).toBe(true);
    });

    it('should keep collapsed state during resize', async () => {
      const breakpointObserver = TestBed.inject(BreakpointObserverMock);
      await harness.toggleCollapse();
      expect(await harness.isCollapsed()).toBe(true);
      breakpointObserver.isSmall.next(true);
      expect(await harness.isCollapsed()).toBe(true);
      breakpointObserver.isSmall.next(false);
      expect(await harness.isCollapsed()).toBe(true);

      await harness.toggleCollapse();
      expect(await harness.isExpanded()).toBe(true);
      breakpointObserver.isSmall.next(true);
      expect(await harness.isCollapsed()).toBe(true);
      breakpointObserver.isSmall.next(false);
      expect(await harness.isExpanded()).toBe(true);
    });

    it('should keep consumer provided collapsed state', async () => {
      const breakpointObserver = TestBed.inject(BreakpointObserverMock);
      component.collapsed.set(true);
      await fixture.whenStable();
      breakpointObserver.isSmall.next(false);
      fixture.detectChanges();
      breakpointObserver.isSmall.next(true);
      expect(await harness.isCollapsed()).toBe(true);
      breakpointObserver.isSmall.next(false);
      expect(await harness.isCollapsed()).toBe(true);
    });

    it('should open flyout menu', async () => {
      component.collapsed.set(true);
      component.showDeclarativeFlyoutGroup.set(true);
      fixture.detectChanges();
      await fixture.whenStable();

      const item = await harness.findItemByLabel('item-1');
      await item.click();

      expect(await item.isFlyout()).toBe(true);
      document.body.click();

      expect(await item.isFlyout()).toBe(false);
    });

    it('should open flyout on click when alwaysOpenGroupsInFlyout is set', async () => {
      component.alwaysOpenGroupsInFlyout.set(true);
      component.showDeclarativeFlyoutGroup.set(true);
      fixture.detectChanges();
      await fixture.whenStable();

      const item = await harness.findItemByLabel('item-1');
      await item.click();
      expect(await item.isFlyout()).toBe(true);
    });

    it('should open flyout on mouseenter when alwaysOpenGroupsInFlyout is set', async () => {
      component.alwaysOpenGroupsInFlyout.set(true);
      component.showDeclarativeFlyoutGroup.set(true);
      fixture.detectChanges();
      await fixture.whenStable();

      const item = await harness.findItemByLabel('item-1');
      const host = await item.host();
      await host.dispatchEvent('mouseenter');
      await fixture.whenStable();
      expect(await item.isFlyout()).toBe(true);
    });

    it('should close flyout on mouseleave when alwaysOpenGroupsInFlyout is set', async () => {
      component.alwaysOpenGroupsInFlyout.set(true);
      component.showDeclarativeFlyoutGroup.set(true);
      fixture.detectChanges();
      await fixture.whenStable();

      const item = await harness.findItemByLabel('item-1');
      const host = await item.host();
      await host.dispatchEvent('mouseenter');
      await fixture.whenStable();
      expect(await item.isFlyout()).toBe(true);

      await host.dispatchEvent('mouseleave');
      // timer fires after 200ms — use fake timers if available, else just check schedule
      document.body.click();
      await fixture.whenStable();
      expect(await item.isFlyout()).toBe(false);
    });

    it('should not open flyout on hover when alwaysOpenGroupsInFlyout is not set', async () => {
      component.showDeclarativeFlyoutGroup.set(true);
      fixture.detectChanges();
      await fixture.whenStable();

      const item = await harness.findItemByLabel('item-1');
      const host = await item.host();
      await host.dispatchEvent('mouseenter');
      await fixture.whenStable();
      expect(await item.isFlyout()).toBe(false);
    });

    it('should emit search event', async () => {
      component.collapsed.set(true);

      await harness.toggleCollapse();

      const spySearch = vi.spyOn(component, 'searchEvent');
      await harness.search('test');
      expect(spySearch).toHaveBeenCalledWith('test');
    });

    it('should support navigation', async () => {
      component.showDeclarativeNavigationGroup.set(true);
      fixture.detectChanges();
      await fixture.whenStable();

      const item = await harness.findItemByLabel('item1');
      await item.click();
      let [subItem1, subItem2] = await item.getChildren();
      expect(await subItem1.isActive()).toBe(false);
      expect(await subItem2.isActive()).toBe(false);
      expect(await item.isActive()).toBe(false);
      await subItem1.click();
      [subItem1, subItem2] = await item.getChildren();
      expect(await subItem1.isActive()).toBe(true);
      expect(await subItem2.isActive()).toBe(false);
      await TestBed.inject(Router).navigate(['/item-1/sub-item-1/sub-path']);
      fixture.detectChanges();
      expect(await subItem1.isActive()).toBe(false);

      await TestBed.inject(Router).navigate(['/item-1/sub-item-2/sub-path']);
      fixture.detectChanges();
      [subItem1, subItem2] = await item.getChildren();
      expect(await subItem1.isActive()).toBe(false);
      expect(await subItem2.isActive()).toBe(true);
    });
  });

  describe('with SiUIStateService', () => {
    let uiStateService: SiUIStateService;

    beforeEach(async () => {
      uiStateService = TestBed.inject(SI_UI_STATE_SERVICE);
      component.stateId = 'test';
      // Do init harness, so that we can write data to the store first.
      await uiStateService.save(component.stateId!, {
        expandedItems: { 'item1': true, 'item2': false }
      });
    });

    it('should load/save UI State for new items style', async () => {
      component.showDeclarativeStateGroups.set(true);
      fixture.detectChanges();
      await fixture.whenStable();

      const harness = await harnessLoader.getHarness(SiNavbarVerticalNextHarness);
      const [item1, item2] = await harness.findItems();
      expect(await item1.isExpanded()).toBe(true);
      expect(await item2.isExpanded()).toBe(false);

      await item2.click();
      await item1.click();
      const state = await uiStateService.load<any>(component.stateId!);
      expect(state.expandedItems.item1).toBe(false);
      expect(state.expandedItems.item2).toBe(true);
    });

    it('should restore collapsed state', async () => {
      await uiStateService.save(component.stateId!, { preferCollapse: true });
      const harness = await harnessLoader.getHarness(SiNavbarVerticalNextHarness);
      expect(await harness.isCollapsed()).toBe(true);
    });

    it('should not restore expanded state on small screen', async () => {
      const breakpointObserver = TestBed.inject(BreakpointObserverMock);
      component.collapsed.set(true);
      await uiStateService.save(component.stateId!, { preferCollapse: false });
      const harness = await harnessLoader.getHarness(SiNavbarVerticalNextHarness);
      breakpointObserver.isSmall.next(true);
      expect(await harness.isCollapsed()).toBe(true);
    });
  });
});
