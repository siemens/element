/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, Injectable } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import {
  MenuItem,
  provideSiUiState,
  SI_UI_STATE_SERVICE,
  SiUIStateService,
  UIStateStorage
} from '@spike-rabbit/element-ng/common';
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

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SiNavbarVerticalComponent, NoopAnimationsModule, TestHostComponent],
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
  }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    harnessLoader = TestbedHarnessEnvironment.loader(fixture);
  });

  describe('without SiUIStateService', () => {
    let harness: SiNavbarVerticalHarness;
    beforeEach(async () => (harness = await harnessLoader.getHarness(SiNavbarVerticalHarness)));

    it('should expand/collapse navbar with click', async () => {
      component.collapsed = true;
      expect(await harness.isCollapsed()).toBeTrue();
      await harness.toggleCollapse();
      expect(await harness.isExpanded()).toBeTrue();
      await harness.toggleCollapse();
      expect(await harness.isCollapsed()).toBeTrue();
    });

    it('should expand on search button click with textonly false', async () => {
      component.textOnly = false;
      component.collapsed = true;
      await harness.clickSearch();
      expect(await harness.isExpanded()).toBeTrue();
    });

    it('should keep collapsed state during resize', async () => {
      const breakpointObserver = TestBed.inject(BreakpointObserverMock);
      await harness.toggleCollapse();
      expect(await harness.isCollapsed()).toBeTrue();
      breakpointObserver.isSmall.next(true);
      expect(await harness.isCollapsed()).toBeTrue();
      breakpointObserver.isSmall.next(false);
      expect(await harness.isCollapsed()).toBeTrue();

      await harness.toggleCollapse();
      expect(await harness.isExpanded()).toBeTrue();
      breakpointObserver.isSmall.next(true);
      expect(await harness.isCollapsed()).toBeTrue();
      breakpointObserver.isSmall.next(false);
      expect(await harness.isExpanded()).toBeTrue();
    });

    it('should keep consumer provided collapsed state', async () => {
      const breakpointObserver = TestBed.inject(BreakpointObserverMock);
      component.collapsed = true;
      breakpointObserver.isSmall.next(false);
      fixture.detectChanges();
      breakpointObserver.isSmall.next(true);
      expect(await harness.isCollapsed()).toBeTrue();
      breakpointObserver.isSmall.next(false);
      expect(await harness.isCollapsed()).toBeTrue();
    });

    it('should open flyout menu', async () => {
      component.collapsed = true;
      component.items = [{ 'type': 'group', 'children': [], 'label': 'item-1' }];
      const item = await harness.findItemByLabel('item-1');
      await item.click();
      expect(await item.isFlyout()).toBeTrue();
      document.body.click();
      expect(await item.isFlyout()).toBeFalse();
    });

    it('should emit search event', fakeAsync(async () => {
      component.collapsed = true;
      await harness.toggleCollapse();

      const spySearch = spyOn(component, 'searchEvent');
      await harness.search('test');
      tick(400);
      expect(spySearch).toHaveBeenCalledOnceWith('test');
    }));

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

      const item = await harness.findItemByLabel('item1');
      await item.click();
      let [subItem1, subItem2] = await item.getChildren();
      expect(await subItem1.isActive()).toBeFalse();
      expect(await subItem2.isActive()).toBeFalse();
      expect(await item.isActive()).toBeFalse();
      await subItem1.click();
      [subItem1, subItem2] = await item.getChildren();
      expect(await subItem1.isActive()).toBeTrue();
      expect(await subItem2.isActive()).toBeFalse();
      await TestBed.inject(Router).navigate(['/item-1/sub-item-1/sub-path']);
      fixture.detectChanges();
      expect(await subItem1.isActive()).toBeFalse();

      await TestBed.inject(Router).navigate(['/item-1/sub-item-2/sub-path']);
      fixture.detectChanges();
      [subItem1, subItem2] = await item.getChildren();
      expect(await subItem1.isActive()).toBeFalse();
      expect(await subItem2.isActive()).toBeTrue();
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

      const [link, toggle] = await harness.findItems();
      await link.click();
      expect(await toggle.isActive()).toBeTrue();
      expect(await link.isActive()).toBeTrue();

      await toggle.click();
      let [subItem1, subItem2] = await toggle.getChildren();
      expect(await subItem1.isActive()).toBeFalse();
      expect(await subItem2.isActive()).toBeFalse();
      await subItem1.click();
      [subItem1, subItem2] = await toggle.getChildren();
      expect(await subItem1.isActive()).toBeTrue();
      expect(await subItem2.isActive()).toBeFalse();

      await TestBed.inject(Router).navigate(['/item-1/sub-item-2/sub-path']);
      fixture.detectChanges();
      [subItem1, subItem2] = await toggle.getChildren();
      expect(await subItem1.isActive()).toBeFalse();
      expect(await subItem2.isActive()).toBeTrue();
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
      expect(await item1.isExpanded()).toBeTrue();
      expect(await item2.getLabel()).toEqual('item2');
      expect(await item2.isExpanded()).toBeFalse();
    });

    it('should save ui-state', async () => {
      component.items = [
        { title: 'item1', id: 'item1', items: [{ title: 'subItem1' }, { title: 'subItem2' }] },
        { title: 'item2', id: 'item2', items: [{ title: 'subItem1' }, { title: 'subItem2' }] }
      ];

      const harness = await harnessLoader.getHarness(SiNavbarVerticalHarness);
      await harness.findItemByLabel('item2').then(item => item.click());
      const state = await uiStateService.load<any>(component.stateId!);
      expect(state!.expandedItems.item2).toBeTrue();
    });

    it('should load/save UI State for new items style', async () => {
      component.items = [
        { type: 'group', children: [], label: 'item1', id: 'item1' },
        { type: 'group', children: [], label: 'item2', id: 'item2', expanded: true }
      ];

      const harness = await harnessLoader.getHarness(SiNavbarVerticalHarness);
      const [item1, item2] = await harness.findItems();
      expect(await item1.isExpanded()).toBeTrue();
      expect(await item2.isExpanded()).toBeFalse();

      await item2.click();
      await item1.click();
      const state = await uiStateService.load<any>(component.stateId!);
      expect(state).toEqual({ expandedItems: { item2: true } });
    });

    it('should restore collapsed state', async () => {
      await uiStateService.save(component.stateId!, { preferCollapse: true });
      const harness = await harnessLoader.getHarness(SiNavbarVerticalHarness);
      expect(await harness.isCollapsed()).toBeTrue();
    });

    it('should not restore expanded state on small screen', async () => {
      const breakpointObserver = TestBed.inject(BreakpointObserverMock);
      component.collapsed = true;
      await uiStateService.save(component.stateId!, { preferCollapse: false });
      const harness = await harnessLoader.getHarness(SiNavbarVerticalHarness);
      breakpointObserver.isSmall.next(true);
      expect(await harness.isCollapsed()).toBeTrue();
    });
  });
});
