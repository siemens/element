/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ChangeDetectionStrategy, Component, Injectable } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  SiHeaderDropdownComponent,
  SiHeaderDropdownItemComponent,
  SiHeaderDropdownTriggerDirective
} from '@spike-rabbit/element-ng/header-dropdown';
import { runOnPushChangeDetection } from '@spike-rabbit/element-ng/test-helpers';
import { BehaviorSubject, Observable } from 'rxjs';

import { SiLaunchpadFactoryComponent } from './launchpad/si-launchpad-factory.component';
import { SiApplicationHeaderComponent } from './si-application-header.component';
import { SiHeaderActionItemComponent } from './si-header-action-item.component';
import { SiHeaderActionsDirective } from './si-header-actions.directive';
import { SiHeaderCollapsibleActionsComponent } from './si-header-collapsible-actions.component';
import { SiHeaderNavigationItemComponent } from './si-header-navigation-item.component';
import { SiHeaderNavigationComponent } from './si-header-navigation.component';
import { SiApplicationHeaderHarness } from './testing/si-application-header.harness';
import { SiHeaderItemHarness } from './testing/si-header-item.harness';

describe('SiApplicationHeaderComponent', () => {
  let loader: HarnessLoader;
  let headerHarness: SiApplicationHeaderHarness;

  describe('with all types of dropdowns in mobile mode', () => {
    @Component({
      imports: [
        SiApplicationHeaderComponent,
        SiHeaderNavigationItemComponent,
        SiHeaderDropdownComponent,
        SiHeaderDropdownItemComponent,
        SiHeaderDropdownTriggerDirective,
        SiHeaderActionItemComponent,
        SiHeaderCollapsibleActionsComponent,
        SiHeaderNavigationComponent,
        SiHeaderActionsDirective
      ],
      template: `
        <si-application-header expandBreakpoint="never">
          <si-header-navigation>
            <button
              si-header-navigation-item
              type="button"
              [siHeaderDropdownTriggerFor]="dropdown1"
            >
              NavItem
            </button>
          </si-header-navigation>
          <si-header-actions class="header-actions">
            <button
              type="button"
              si-header-action-item
              icon="fake-icon"
              [siHeaderDropdownTriggerFor]="dropdown1"
            >
              AItem 1
            </button>
            <si-header-collapsible-actions>
              <button
                type="button"
                si-header-action-item
                icon="fake-icon"
                [siHeaderDropdownTriggerFor]="dropdown1"
              >
                AItem 2
              </button>
            </si-header-collapsible-actions>
          </si-header-actions>
        </si-application-header>

        <ng-template #dropdown1>
          <si-header-dropdown>
            <si-header-dropdown-item [siHeaderDropdownTriggerFor]="dropdown2">
              DItem 1
            </si-header-dropdown-item>
          </si-header-dropdown>
        </ng-template>

        <ng-template #dropdown2>
          <si-header-dropdown>
            <si-header-dropdown-item>DItem 2</si-header-dropdown-item>
          </si-header-dropdown>
        </ng-template>
      `,
      changeDetection: ChangeDetectionStrategy.OnPush
    })
    class TestHostComponent {}

    let fixture: ComponentFixture<TestHostComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TestHostComponent]
      });
    });

    beforeEach(async () => {
      fixture = TestBed.createComponent(TestHostComponent);
      loader = TestbedHarnessEnvironment.loader(fixture);
      headerHarness = await loader.getHarness(SiApplicationHeaderHarness);
    });

    it('should have backdrop for nav-item opened', async () => {
      await headerHarness.openNavigationMobile();
      expect(await headerHarness.hasBackdrop()).toBeTrue();
      const navItemHarness = await headerHarness.getNavigationItem('NavItem');
      await navItemHarness.toggle();
      expect(await headerHarness.hasBackdrop()).toBeTrue();
      await headerHarness.clickBackdrop();
      expect(await headerHarness.hasBackdrop()).toBeFalse();
    });

    it('should have backdrop for action-item opened', async () => {
      const actionItemHarness = await headerHarness.getActionItem('AItem 1');
      await actionItemHarness.toggle();
      expect(await headerHarness.hasBackdrop()).toBeTrue();
      await actionItemHarness
        .getDropdown()
        .then(dropdown => dropdown.getItem('DItem 1'))
        .then(d1 => d1.click());
      expect(await headerHarness.hasBackdrop()).toBeTrue();
      await headerHarness.clickBackdrop();
      expect(await headerHarness.hasBackdrop()).toBeFalse();
    });

    it('should have backdrop for collapsible action-item opened', async () => {
      await headerHarness.openCollapsibleActions();
      expect(await headerHarness.hasBackdrop()).toBeTrue();
      const actionItemHarness = await headerHarness.getActionItem('AItem 2');
      await actionItemHarness.toggle();
      expect(await headerHarness.hasBackdrop()).toBeTrue();
      await headerHarness.clickBackdrop();
      expect(await headerHarness.hasBackdrop()).toBeFalse();
    });

    it('should close others if nav opened', async () => {
      const actionItemHarness = await headerHarness.getActionItem('AItem 1');
      await actionItemHarness.toggle();
      expect(await headerHarness.hasBackdrop()).toBeTrue();
      expect(await actionItemHarness.isOpen()).toBeTrue();
      await headerHarness.openNavigationMobile();
      expect(await actionItemHarness.isOpen()).toBeFalse();
      expect(await headerHarness.hasBackdrop()).toBeTrue();
    });

    it('should close others if action-item opened', async () => {
      await headerHarness.openCollapsibleActions();
      expect(await headerHarness.hasBackdrop()).toBeTrue();
      await headerHarness.getActionItem('AItem 1').then(item => item.toggle());
      expect(await headerHarness.isCollapsibleActionsOpen()).toBeFalse();
      expect(await headerHarness.hasBackdrop()).toBeTrue();
    });

    it('should close others if collapsible actions opened', async () => {
      await headerHarness.openNavigationMobile();
      expect(await headerHarness.hasBackdrop()).toBeTrue();
      await headerHarness.openCollapsibleActions();
      expect(await headerHarness.isNavigationMobileOpen()).toBeFalse();
      expect(await headerHarness.hasBackdrop()).toBeTrue();
    });

    it('should keep collapsible actions open if dropdowns are opened inside', async () => {
      await headerHarness.openCollapsibleActions();
      expect(await headerHarness.isCollapsibleActionsOpen()).toBeTrue();
      const actionItemHarness = await headerHarness.getActionItem('AItem 2');
      await actionItemHarness.toggle();
      await actionItemHarness
        .getDropdown()
        .then(dropdown => dropdown.getItem('DItem 1'))
        .then(d1 => d1.click());
      expect(await headerHarness.isCollapsibleActionsOpen()).toBeTrue();
    });
  });

  describe('with badges', () => {
    @Component({
      imports: [
        SiApplicationHeaderComponent,
        SiHeaderCollapsibleActionsComponent,
        SiHeaderActionItemComponent,
        SiHeaderActionsDirective
      ],
      template: `
        <si-application-header expandBreakpoint="never">
          <si-header-actions>
            <si-header-collapsible-actions>
              <button type="button" si-header-action-item icon="fake-icon" [badge]="bade1">
                Action 1
              </button>
              <button type="button" si-header-action-item icon="fake-icon" [badge]="bade2">
                Action 2
              </button>
            </si-header-collapsible-actions>
          </si-header-actions>
        </si-application-header>
      `,
      changeDetection: ChangeDetectionStrategy.OnPush
    })
    class TestHostComponent {
      bade1?: number | boolean;
      bade2?: number | boolean;
    }
    let fixture: ComponentFixture<TestHostComponent>;
    let component: TestHostComponent;
    let actionItem1Harness: SiHeaderItemHarness;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TestHostComponent]
      });
    });

    beforeEach(async () => {
      fixture = TestBed.createComponent(TestHostComponent);
      component = fixture.componentInstance;
      loader = TestbedHarnessEnvironment.loader(fixture);
      headerHarness = await loader.getHarness(SiApplicationHeaderHarness);
      actionItem1Harness = await headerHarness.getActionItem('Action 1');
    });

    it('should limit numbers to two digits', async () => {
      component.bade1 = 400;
      await runOnPushChangeDetection(fixture);
      expect(await actionItem1Harness.getBadgeText()).toBe('+99');
    });

    it('should show a dot for booleans', async () => {
      component.bade1 = true;
      await runOnPushChangeDetection(fixture);
      expect(await actionItem1Harness.hasBadgeDot()).toBeTrue();
    });

    it('should show a text for numbers', async () => {
      component.bade1 = 42;
      await runOnPushChangeDetection(fixture);
      expect(await actionItem1Harness.getBadgeText()).toBe('42');
    });

    it('should update parent account', async () => {
      expect(await headerHarness.hasCollapsibleActionsBadge()).toBeFalse();
      component.bade1 = 1;
      await runOnPushChangeDetection(fixture);
      expect(await headerHarness.hasCollapsibleActionsBadge()).toBeTrue();
      component.bade2 = true;
      await runOnPushChangeDetection(fixture);
      expect(await headerHarness.hasCollapsibleActionsBadge()).toBeTrue();
      component.bade1 = 0;
      await runOnPushChangeDetection(fixture);
      expect(await headerHarness.hasCollapsibleActionsBadge()).toBeTrue();
      component.bade2 = false;
      await runOnPushChangeDetection(fixture);
      expect(await headerHarness.hasCollapsibleActionsBadge()).toBeFalse();
      component.bade1 = true;
      await runOnPushChangeDetection(fixture);
      expect(await headerHarness.hasCollapsibleActionsBadge()).toBeTrue();
      component.bade1 = 1;
      await runOnPushChangeDetection(fixture);
      expect(await headerHarness.hasCollapsibleActionsBadge()).toBeTrue();
      component.bade1 = false;
      await runOnPushChangeDetection(fixture);
      expect(await headerHarness.hasCollapsibleActionsBadge()).toBeFalse();
    });
  });

  describe('with resizing', () => {
    @Component({
      imports: [
        SiApplicationHeaderComponent,
        SiHeaderCollapsibleActionsComponent,
        SiHeaderActionsDirective,
        SiHeaderNavigationComponent
      ],
      template: `
        <si-application-header>
          <si-header-actions>
            <si-header-navigation />
            <si-header-collapsible-actions />
          </si-header-actions>
        </si-application-header>
      `,
      changeDetection: ChangeDetectionStrategy.OnPush
    })
    class TestHostComponent {}

    @Injectable({ providedIn: 'root' })
    class BreakpointObserverMock implements Partial<BreakpointObserver> {
      observeResult = new BehaviorSubject<BreakpointState>({ matches: true, breakpoints: {} });
      observe(): Observable<BreakpointState> {
        return this.observeResult.asObservable();
      }
    }

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TestHostComponent],
        providers: [{ provide: BreakpointObserver, useExisting: BreakpointObserverMock }]
      });
    });

    let fixture: ComponentFixture<TestHostComponent>;
    let breakpointObserver: BreakpointObserverMock;

    beforeEach(async () => {
      fixture = TestBed.createComponent(TestHostComponent);
      loader = TestbedHarnessEnvironment.loader(fixture);
      headerHarness = await loader.getHarness(SiApplicationHeaderHarness);
      breakpointObserver = TestBed.inject(BreakpointObserverMock);
    });

    it('should close mobile navigation on expand', async () => {
      await headerHarness.openNavigationMobile();
      expect(await headerHarness.isNavigationMobileOpen()).toBeTrue();
      breakpointObserver.observeResult.next({ matches: false, breakpoints: {} });
      expect(await headerHarness.isNavigationMobileOpen()).toBeFalse();
    });

    it('should close collapsible actions on expand', async () => {
      await headerHarness.openCollapsibleActions();
      expect(await headerHarness.isCollapsibleActionsOpen()).toBeTrue();
      breakpointObserver.observeResult.next({ matches: false, breakpoints: {} });
      expect(await headerHarness.isCollapsibleActionsOpen()).toBeFalse();
    });
  });

  describe('with launchpad', () => {
    @Component({
      imports: [
        SiApplicationHeaderComponent,
        SiLaunchpadFactoryComponent,
        SiHeaderNavigationComponent
      ],
      template: `
        <si-application-header expandBreakpoint="never" [launchpad]="launchpad">
          <si-header-navigation />
        </si-application-header>
        <ng-template #launchpad>
          <si-launchpad-factory [apps]="[]" />
        </ng-template>
      `
    })
    class TestHostComponent {}

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TestHostComponent]
      });
    });

    beforeEach(async () => {
      const fixture = TestBed.createComponent(TestHostComponent);
      loader = TestbedHarnessEnvironment.loader(fixture);
      headerHarness = await loader.getHarness(SiApplicationHeaderHarness);
    });

    it('should close other when open launchpad', async () => {
      await headerHarness.openNavigationMobile();
      expect(await headerHarness.isNavigationMobileOpen()).toBeTrue();
      await headerHarness.openLaunchpad();
      expect(await headerHarness.isNavigationMobileOpen()).toBeFalse();
      expect(await headerHarness.getLaunchpad()).toBeTruthy();
    });

    it('should close launchpad when open other', async () => {
      await headerHarness.openLaunchpad();
      expect(await headerHarness.getLaunchpad()).toBeTruthy();
      await headerHarness.openNavigationMobile();
      expect(await headerHarness.getLaunchpad()).toBeFalsy();
      expect(await headerHarness.isNavigationMobileOpen()).toBeTrue();
    });
  });
});
