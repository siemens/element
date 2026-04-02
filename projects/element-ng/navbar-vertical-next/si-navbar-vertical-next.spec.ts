/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, Injectable, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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

import { NavbarVerticalNextItem, SiNavbarVerticalNextComponent } from './index';
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
  imports: [SiNavbarVerticalNextComponent],
  template: `<si-navbar-vertical-next
    [items]="items()"
    [searchable]="true"
    [textOnly]="textOnly()"
    [stateId]="stateId"
    [collapsed]="collapsed()"
    [searchDebounceTime]="0"
    (searchEvent)="searchEvent($event)"
    (itemsChange)="itemsChange($event)"
  />`
})
class TestHostComponent {
  readonly items = signal<(MenuItem | NavbarVerticalNextItem)[]>([
    {
      title: 'item-1',
      link: './item-1'
    },
    {
      title: 'item-2',
      link: './item-2'
    }
  ]);
  readonly textOnly = signal(true);
  stateId?: string;
  readonly collapsed = signal(false);

  searchEvent(event: string): void {}

  itemsChange(event: (MenuItem | NavbarVerticalNextItem)[]): void {}
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
      component.items.set([{ 'type': 'group', 'children': [], 'label': 'item-1' }]);

      const item = await harness.findItemByLabel('item-1');
      await item.click();

      expect(await item.isFlyout()).toBe(true);
      document.body.click();

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
      component.items.set([
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
      ]);
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

    it('should support navigation legacy item', async () => {
      component.items.set([
        {
          items: [
            { title: 'sub-item1', link: 'item-1/sub-item-1' },
            { title: 'sub-item2', link: 'item-1/sub-item-2' }
          ],
          link: 'somewhere-else',
          title: 'item1'
        }
      ]);

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
      component.items.set([
        { title: 'item1', id: 'item1', items: [{ title: 'subItem1' }, { title: 'subItem2' }] },
        { title: 'item2', id: 'item2', items: [{ title: 'subItem1' }, { title: 'subItem2' }] }
      ]);
      const harness = await harnessLoader.getHarness(SiNavbarVerticalNextHarness);
      const [item1, item2] = await harness.findItems();
      expect(await item1.getLabel()).toEqual('item1');
      expect(await item1.isExpanded()).toBe(true);
      expect(await item2.getLabel()).toEqual('item2');
      expect(await item2.isExpanded()).toBe(false);
    });

    it('should save ui-state', async () => {
      component.items.set([
        { title: 'item1', id: 'item1', items: [{ title: 'subItem1' }, { title: 'subItem2' }] },
        { title: 'item2', id: 'item2', items: [{ title: 'subItem1' }, { title: 'subItem2' }] }
      ]);
      const harness = await harnessLoader.getHarness(SiNavbarVerticalNextHarness);
      await harness.findItemByLabel('item2').then(item => item.click());
      const state = await uiStateService.load<any>(component.stateId!);
      expect(state!.expandedItems.item2).toBe(true);
    });

    it('should load/save UI State for new items style', async () => {
      component.items.set([
        { type: 'group', children: [], label: 'item1', id: 'item1' },
        { type: 'group', children: [], label: 'item2', id: 'item2', expanded: true }
      ]);

      const harness = await harnessLoader.getHarness(SiNavbarVerticalNextHarness);
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
