/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, Injectable, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import {
  MenuItem,
  provideSiUiState,
  SI_UI_STATE_SERVICE,
  SiUIStateService,
  UIStateStorage
} from '@siemens/element-ng/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { NavbarVerticalItem, SiNavbarVerticalComponent } from './index';
import { SiNavbarVerticalHarness } from './testing/si-navbar-vertical.harness';

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
  imports: [SiNavbarVerticalComponent],
  template: `<si-navbar-vertical
    [items]="items"
    [searchable]="searchable"
    [textOnly]="textOnly"
    [stateId]="stateId"
    [collapsed]="collapsed"
    (searchEvent)="searchEvent($event)"
    (itemsChange)="itemsChange($event)"
  />`
})
class TestHostComponent {
  items: (MenuItem | NavbarVerticalItem)[] = [
    {
      title: 'item-1',
      link: './item-1'
    },
    {
      title: 'item-2',
      link: './item-2'
    }
  ];
  searchable = true;
  textOnly = true;
  stateId?: string;
  collapsed = false;

  searchEvent(event: string): void {}

  itemsChange(event: (MenuItem | NavbarVerticalItem)[]): void {}
}

describe('SiNavbarVertical', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let harnessLoader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiNavbarVerticalComponent, NoopAnimationsModule, TestHostComponent],
      providers: [
        provideZonelessChangeDetection(),
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
    let harness: SiNavbarVerticalHarness;
    beforeEach(async () => (harness = await harnessLoader.getHarness(SiNavbarVerticalHarness)));

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date());
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should expand/collapse navbar with click', async () => {
      component.collapsed = true;
      fixture.changeDetectorRef.markForCheck();
      expect(await harness.isCollapsed()).toBe(true);
      await harness.toggleCollapse();
      expect(await harness.isExpanded()).toBe(true);
      await harness.toggleCollapse();
      expect(await harness.isCollapsed()).toBe(true);
    });

    it('should expand on search button click with textonly false', async () => {
      component.textOnly = false;
      component.collapsed = true;
      fixture.changeDetectorRef.markForCheck();
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
      component.collapsed = true;
      fixture.changeDetectorRef.markForCheck();
      breakpointObserver.isSmall.next(false);
      fixture.detectChanges();
      breakpointObserver.isSmall.next(true);
      expect(await harness.isCollapsed()).toBe(true);
      breakpointObserver.isSmall.next(false);
      expect(await harness.isCollapsed()).toBe(true);
    });

    it('should open flyout menu', async () => {
      component.collapsed = true;
      component.items = [{ 'type': 'group', 'children': [], 'label': 'item-1' }];
      fixture.changeDetectorRef.markForCheck();
      const item = await harness.findItemByLabel('item-1');
      await item.click();
      await fixture.whenStable();
      expect(await item.isFlyout()).toBe(true);
      document.body.click();
      await fixture.whenStable();
      expect(await item.isFlyout()).toBe(false);
    });

    it('should emit search event', async () => {
      component.collapsed = true;
      fixture.changeDetectorRef.markForCheck();
      await harness.toggleCollapse();

      const spySearch = vi.spyOn(component, 'searchEvent');
      await harness.search('test');
      vi.advanceTimersByTime(400);
      await fixture.whenStable();
      expect(spySearch).toHaveBeenCalledTimes(1);
      expect(spySearch).toHaveBeenCalledWith('test');
    });

    it('should support navigation', async () => {
      component.items = [
        {
          type: 'group',
          children: [
            {
              type: 'router-link',
              label: 'sub-item1',
              routerLink: 'item-1/sub-item-1',
              activeMatchOptions: { exact: true }
            },
            { type: 'router-link', label: 'sub-item2', routerLink: 'item-1/sub-item-2' }
          ],
          label: 'item1'
        }
      ];
      fixture.changeDetectorRef.markForCheck();

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

    it('should support navigation legacy item', async () => {
      component.items = [
        {
          items: [
            { title: 'sub-item1', link: 'item-1/sub-item-1' },
            { title: 'sub-item2', link: 'item-1/sub-item-2' }
          ],
          link: 'somewhere-else',
          title: 'item1'
        }
      ];
      fixture.changeDetectorRef.markForCheck();

      const [link, toggle] = await harness.findItems();
      await link.click();
      expect(await toggle.isActive()).toBe(true);
      expect(await link.isActive()).toBe(true);

      await toggle.click();
      let [subItem1, subItem2] = await toggle.getChildren();
      expect(await subItem1.isActive()).toBe(false);
      expect(await subItem2.isActive()).toBe(false);
      await subItem1.click();
      [subItem1, subItem2] = await toggle.getChildren();
      expect(await subItem1.isActive()).toBe(true);
      expect(await subItem2.isActive()).toBe(false);

      await TestBed.inject(Router).navigate(['/item-1/sub-item-2/sub-path']);
      fixture.detectChanges();
      [subItem1, subItem2] = await toggle.getChildren();
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

    it('should load ui-state', async () => {
      component.items = [
        { title: 'item1', id: 'item1', items: [{ title: 'subItem1' }, { title: 'subItem2' }] },
        { title: 'item2', id: 'item2', items: [{ title: 'subItem1' }, { title: 'subItem2' }] }
      ];
      const harness = await harnessLoader.getHarness(SiNavbarVerticalHarness);
      const [item1, item2] = await harness.findItems();
      expect(await item1.getLabel()).toEqual('item1');
      expect(await item1.isExpanded()).toBe(true);
      expect(await item2.getLabel()).toEqual('item2');
      expect(await item2.isExpanded()).toBe(false);
    });

    it('should save ui-state', async () => {
      component.items = [
        { title: 'item1', id: 'item1', items: [{ title: 'subItem1' }, { title: 'subItem2' }] },
        { title: 'item2', id: 'item2', items: [{ title: 'subItem1' }, { title: 'subItem2' }] }
      ];

      const harness = await harnessLoader.getHarness(SiNavbarVerticalHarness);
      await harness.findItemByLabel('item2').then(item => item.click());
      const state = await uiStateService.load<any>(component.stateId!);
      expect(state!.expandedItems.item2).toBe(true);
    });

    it('should load/save UI State for new items style', async () => {
      component.items = [
        { type: 'group', children: [], label: 'item1', id: 'item1' },
        { type: 'group', children: [], label: 'item2', id: 'item2', expanded: true }
      ];

      const harness = await harnessLoader.getHarness(SiNavbarVerticalHarness);
      const [item1, item2] = await harness.findItems();
      expect(await item1.isExpanded()).toBe(true);
      expect(await item2.isExpanded()).toBe(false);

      await item2.click();
      await item1.click();
      const state = await uiStateService.load<any>(component.stateId!);
      expect(state).toEqual({ expandedItems: { item2: true } });
    });

    it('should restore collapsed state', async () => {
      await uiStateService.save(component.stateId!, { preferCollapse: true });
      const harness = await harnessLoader.getHarness(SiNavbarVerticalHarness);
      expect(await harness.isCollapsed()).toBe(true);
    });

    it('should not restore expanded state on small screen', async () => {
      const breakpointObserver = TestBed.inject(BreakpointObserverMock);
      component.collapsed = true;
      await uiStateService.save(component.stateId!, { preferCollapse: false });
      const harness = await harnessLoader.getHarness(SiNavbarVerticalHarness);
      breakpointObserver.isSmall.next(true);
      expect(await harness.isCollapsed()).toBe(true);
    });
  });
});
