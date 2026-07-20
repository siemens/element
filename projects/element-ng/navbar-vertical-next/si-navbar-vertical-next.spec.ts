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
import { page, userEvent } from 'vitest/browser';

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
      [inlineCollapse]="inlineCollapse()"
      [alwaysFlyout]="alwaysFlyout()"
    >
      <si-navbar-vertical-next-search [debounceTime]="0" (searchChange)="searchEvent($event)" />
      @if (showDeclarativeFlyoutGroup()) {
        <si-navbar-vertical-next-items>
          <button
            type="button"
            si-navbar-vertical-next-item
            label="item-1"
            [siNavbarVerticalNextGroupTriggerFor]="flyoutGroup"
          >
          </button>
        </si-navbar-vertical-next-items>
      }

      @if (showDeclarativeNavigationGroup()) {
        <si-navbar-vertical-next-items>
          <button
            type="button"
            si-navbar-vertical-next-item
            label="item1"
            [siNavbarVerticalNextGroupTriggerFor]="navigationGroup"
          >
          </button>
        </si-navbar-vertical-next-items>
      }

      @if (showDeclarativeStateGroups()) {
        <si-navbar-vertical-next-items>
          <button
            type="button"
            si-navbar-vertical-next-item
            stateId="item1"
            label="item1"
            [siNavbarVerticalNextGroupTriggerFor]="stateGroupOne"
          >
          </button>
          <button
            type="button"
            si-navbar-vertical-next-item
            stateId="item2"
            label="item2"
            [siNavbarVerticalNextGroupTriggerFor]="stateGroupTwo"
          >
            item2
          </button>
        </si-navbar-vertical-next-items>
      }
    </si-navbar-vertical-next>

    <ng-template #flyoutGroup>
      <si-navbar-vertical-next-group>
        <a
          si-navbar-vertical-next-item
          label="sub-item1"
          routerLink="item-1/sub-item-1"
          routerLinkActive
        >
        </a>
      </si-navbar-vertical-next-group>
    </ng-template>

    <ng-template #navigationGroup>
      <si-navbar-vertical-next-group routerLinkActive>
        <a
          si-navbar-vertical-next-item
          routerLink="item-1/sub-item-1"
          routerLinkActive
          label="sub-item1"
          [routerLinkActiveOptions]="{ exact: true }"
        >
        </a>
        <a
          si-navbar-vertical-next-item
          label="sub-item2"
          routerLink="item-1/sub-item-2"
          routerLinkActive
        >
        </a>
      </si-navbar-vertical-next-group>
    </ng-template>

    <ng-template #stateGroupOne>
      <si-navbar-vertical-next-group>
        <a
          si-navbar-vertical-next-item
          label="sub-item1"
          routerLink="item-1/sub-item-1"
          routerLinkActive
        >
        </a>
      </si-navbar-vertical-next-group>
    </ng-template>

    <ng-template #stateGroupTwo>
      <si-navbar-vertical-next-group>
        <a
          si-navbar-vertical-next-item
          label="sub-item2"
          routerLink="item-1/sub-item-2"
          routerLinkActive
        >
        </a>
      </si-navbar-vertical-next-group>
    </ng-template>`
})
class TestHostComponent {
  readonly textOnly = signal(true);
  stateId?: string;
  readonly collapsed = signal(false);
  readonly inlineCollapse = signal(false);
  readonly alwaysFlyout = signal(false);
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

    it('should re-expand the active group when switching back from flyout to inline mode', async () => {
      component.textOnly.set(false);
      component.showDeclarativeNavigationGroup.set(true);
      await fixture.whenStable();

      await TestBed.inject(Router).navigate(['/item-1/sub-item-2/sub-path']);
      await fixture.whenStable();

      const item = page.getByRole('button', { name: 'item1' });

      // Switch to flyout mode: groups collapse, overlays render on click.
      component.alwaysFlyout.set(true);
      await fixture.whenStable();
      expect(item.element()).toHaveAttribute('aria-expanded', 'false');
      const flyoutId = item.element().getAttribute('aria-controls');
      expect(document.querySelector(`#${flyoutId} .dropdown-menu`)).toBeNull();

      // Switch back to inline: the children re-mount and the active child's
      // `ngOnInit` cascade re-expands the parent group automatically.
      component.alwaysFlyout.set(false);
      await fixture.whenStable();
      expect(item.element()).toHaveAttribute('aria-expanded', 'true');
      const subItem2 = page.getByRole('link', { name: 'sub-item2' });
      expect(subItem2.element()).toHaveClass('active');
    });

    it('should restore manual group expansion after collapsing and re-expanding the navbar', async () => {
      component.textOnly.set(false);
      component.showDeclarativeNavigationGroup.set(true);
      await fixture.whenStable();

      const item = page.getByRole('button', { name: 'item1' });
      const collapseToggle = page.getByRole('button', { name: 'Toggle' });

      // User expands the group inline.
      await userEvent.click(item);
      await fixture.whenStable();
      expect(item.element()).toHaveAttribute('aria-expanded', 'true');

      // Collapsing the navbar switches to flyout overlays — inline expansion
      // is hidden but the underlying state must be retained.
      await userEvent.click(collapseToggle);
      await fixture.whenStable();
      expect(collapseToggle.element()).toHaveAttribute('aria-expanded', 'false');
      const flyoutId = item.element().getAttribute('aria-controls');
      expect(document.querySelector(`#${flyoutId} .dropdown-menu`)).toBeNull();

      // Re-expanding the navbar restores the previous inline expansion.
      await userEvent.click(collapseToggle);
      await fixture.whenStable();
      expect(collapseToggle.element()).toHaveAttribute('aria-expanded', 'true');
      expect(item.element()).toHaveAttribute('aria-expanded', 'true');
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

  describe('with inlineCollapse', () => {
    beforeEach(() => {
      component.inlineCollapse.set(true);
      component.textOnly.set(false);
      component.showDeclarativeNavigationGroup.set(true);
    });

    it('should add nav-inline-collapse host class', async () => {
      await fixture.whenStable();
      const host = page.getByRole('navigation').element().closest('si-navbar-vertical-next')!;
      expect(host).toHaveClass('nav-inline-collapse');
    });

    it('should inert the content when collapsed', async () => {
      component.collapsed.set(true);
      await fixture.whenStable();

      const host = fixture.nativeElement.querySelector('si-navbar-vertical-next') as HTMLElement;
      expect(host).toHaveClass('nav-collapsed', 'nav-inline-collapse');

      const nav = page.getByRole('navigation').element();
      expect(nav).toHaveAttribute('tabindex', '-1');

      const content = host.querySelector('.nav-content') as HTMLElement;
      expect(content).toHaveAttribute('inert', '');

      // Page reclaims its full inline-start space when collapsed.
      expect(host).toHaveStyle({ paddingInlineStart: '0px' });
    });

    it('should drop inert when expanded', async () => {
      component.collapsed.set(false);
      await fixture.whenStable();

      const host = fixture.nativeElement.querySelector('si-navbar-vertical-next') as HTMLElement;
      expect(host).not.toHaveClass('nav-collapsed');

      const content = host.querySelector('.nav-content') as HTMLElement;
      expect(content).not.toHaveAttribute('inert');
    });

    it('should expose correct aria-expanded on the toggle', async () => {
      component.collapsed.set(true);
      await fixture.whenStable();

      const host = fixture.nativeElement.querySelector('si-navbar-vertical-next') as HTMLElement;
      const toggle = host.querySelector('.toggle-button') as HTMLButtonElement;

      expect(toggle).toHaveAttribute('aria-expanded', 'false');

      component.collapsed.set(false);
      await fixture.whenStable();
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
    });

    describe('active item chip', () => {
      beforeEach(() => {
        component.collapsed.set(true);
      });

      it('should not render a chip when no item is active', async () => {
        await fixture.whenStable();

        const host = fixture.nativeElement.querySelector('si-navbar-vertical-next') as HTMLElement;
        expect(host.querySelector('.chip')).not.toBeInTheDocument();
      });

      it('should render the active top-level item as a chip', async () => {
        await TestBed.inject(Router).navigate(['/item-1/sub-item-1']);
        await fixture.whenStable();

        const host = fixture.nativeElement.querySelector('si-navbar-vertical-next') as HTMLElement;
        const chip = host.querySelector('.chip') as HTMLButtonElement;
        expect(chip).toBeInTheDocument();
        expect(chip).not.toHaveAttribute('inert');
        expect(chip).not.toHaveAttribute('aria-hidden');
        expect(chip).toHaveAccessibleName('item1');
        await expect.element(chip).toBeVisible();
      });

      it('should open the sub-item flyout when the chip is clicked', async () => {
        await TestBed.inject(Router).navigate(['/item-1/sub-item-1']);
        await fixture.whenStable();

        const host = fixture.nativeElement.querySelector('si-navbar-vertical-next') as HTMLElement;
        const chip = host.querySelector('.chip') as HTMLButtonElement;

        await userEvent.click(chip);
        await fixture.whenStable();

        expect(chip).toHaveAttribute('aria-expanded', 'true');
        const menuId = chip.getAttribute('aria-controls');
        const menu = document.querySelector(`#${menuId}`);
        expect(menu).toBeInTheDocument();
        expect(menu).toHaveClass('chip-menu-panel');
        expect(menu!.textContent).toContain('item1');
      });
    });
  });
});
