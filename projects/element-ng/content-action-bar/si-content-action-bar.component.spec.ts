/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MenuItem } from '@siemens/element-ng/menu';

import { SiContentActionBarComponent } from './si-content-action-bar.component';
import { ContentActionBarMainItem, ViewType } from './si-content-action-bar.model';
import { SiContentActionBarHarness } from './testing/si-content-action-bar.harness';

describe('SiContentActionBarComponent', () => {
  let fixture: ComponentFixture<SiContentActionBarComponent>;
  let harness: SiContentActionBarHarness;
  let primaryActions: WritableSignal<ContentActionBarMainItem[]>;
  let secondaryActions: WritableSignal<MenuItem[]>;
  let viewType: WritableSignal<ViewType>;
  let preventIconsInDropdownMenus: WritableSignal<boolean>;

  beforeEach(() => {
    primaryActions = signal<ContentActionBarMainItem[]>([]);
    secondaryActions = signal<MenuItem[]>([]);
    viewType = signal<ViewType>('expanded');
    preventIconsInDropdownMenus = signal(false);

    TestBed.configureTestingModule({
      providers: [provideRouter([])]
    });

    fixture = TestBed.createComponent(SiContentActionBarComponent, {
      bindings: [
        inputBinding('primaryActions', primaryActions),
        inputBinding('secondaryActions', secondaryActions),
        inputBinding('viewType', viewType),
        inputBinding('preventIconsInDropdownMenus', preventIconsInDropdownMenus)
      ]
    });
  });

  beforeEach(async () => {
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, SiContentActionBarHarness);
  });

  it('should set primary actions', async () => {
    primaryActions.set([
      { type: 'link', label: 'Create', href: '#' },
      { type: 'router-link', label: 'Route me', routerLink: '/' },
      { type: 'group', label: 'Save', children: [] },
      { type: 'action', label: 'Delete', action: () => alert('Delete') }
    ]);
    await fixture.whenStable();
    expect(await harness.getPrimaryActionTexts()).toEqual(['Create', 'Route me', 'Save', 'Delete']);
  });

  it('should set secondary actions', async () => {
    secondaryActions.set([
      { type: 'action', label: 'Import', action: () => alert('Import') },
      { type: 'action', label: 'Export', action: () => alert('Export') },
      {
        type: 'group',
        label: 'Print',
        children: [
          { type: 'action', label: 'PDF', action: () => alert('PDF') },
          { type: 'action', label: 'Image', action: () => alert('Image') }
        ]
      }
    ]);
    await fixture.whenStable();

    await harness.toggleSecondary();
    const secondaryMenu = await harness.getSecondaryMenu();
    expect(await secondaryMenu.getItemTexts()).toEqual(['Import', 'Export', 'Print']);

    const printItem = await secondaryMenu.getItem('Print');
    await printItem.hover();
    expect(await printItem.getSubmenu().then(subMenu => subMenu.getItemTexts())).toEqual([
      'PDF',
      'Image'
    ]);
  });

  it('should activate links when the menu icon is clicked', async () => {
    viewType.set('collapsible');
    primaryActions.set([
      {
        type: 'group',
        label: 'Item',
        children: [
          {
            type: 'group',
            label: 'Subitem',
            children: [{ type: 'action', label: 'Last-child', action: () => {} }]
          }
        ]
      }
    ]);
    await fixture.whenStable();

    // cannot use jasmine.clock here
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(await harness.isPrimaryExpanded()).toBe(false);
    await harness.togglePrimary();
    await fixture.whenStable();
    expect(await harness.isPrimaryExpanded()).toBe(true);
  });

  it('should disable menu item by disabled attribute', async () => {
    viewType.set('expanded');
    primaryActions.set([{ type: 'action', label: 'Item', disabled: true, action: () => {} }]);
    await fixture.whenStable();

    expect(await harness.getPrimaryAction('Item').then(item => item.isDisabled())).toBe(true);
  });

  it('should call action on item click', async () => {
    const actionSpy = vi.fn();
    viewType.set('expanded');
    primaryActions.set([{ type: 'action', label: 'Item', action: actionSpy }]);
    await fixture.whenStable();
    await harness.getPrimaryAction('Item').then(item => item.click());
    expect(actionSpy).toHaveBeenCalled();
  });

  describe('#preventIconsInDropdownMenus', () => {
    it('should show primary action icon', async () => {
      primaryActions.set([
        { type: 'action', label: 'primaryItem', icon: 'element-user', action: () => {} }
      ]);
      preventIconsInDropdownMenus.set(true);
      await fixture.whenStable();
      expect(
        await harness.getPrimaryAction('primaryItem').then(item => item.hasIcon('element-user'))
      ).toBe(true);
    });

    it('should show primary action icon in in menu', async () => {
      primaryActions.set([
        { type: 'action', label: 'primaryItem', icon: 'element-user', action: () => {} }
      ]);
      viewType.set('mobile');
      await fixture.whenStable();

      await harness.toggleMobile();
      expect(
        await harness
          .getMobileMenu()
          .then(menu => menu.getItem('primaryItem'))
          .then(item => item.hasIcon('element-user'))
      ).toBe(true);
    });

    it('should not show primary action icon in menus with mobile view', async () => {
      primaryActions.set([
        { type: 'action', label: 'primaryItem', icon: 'element-user', action: () => {} }
      ]);
      viewType.set('mobile');
      preventIconsInDropdownMenus.set(true);
      await fixture.whenStable();

      await harness.toggleMobile();
      expect(
        await harness
          .getMobileMenu()
          .then(menu => menu.getItem('primaryItem'))
          .then(item => item.hasIcon('element-user'))
      ).toBe(false);
    });

    it('should show secondary action icon in menu with expanded view', async () => {
      viewType.set('expanded');
      primaryActions.set([
        { type: 'action', label: 'primaryItem', icon: 'element-user', action: () => {} }
      ]);
      secondaryActions.set([
        { type: 'action', label: 'secondaryItem', icon: 'element-copy', action: () => {} }
      ]);
      await fixture.whenStable();

      await harness.toggleSecondary();
      expect(
        await harness
          .getSecondaryMenu()
          .then(menu => menu.getItem('secondaryItem'))
          .then(item => item.hasIcon('element-copy'))
      ).toBe(true);
    });

    it('should not show secondary action icon in menus with expanded view', async () => {
      viewType.set('expanded');
      primaryActions.set([
        { type: 'action', label: 'primaryItem', icon: 'element-user', action: () => {} }
      ]);
      secondaryActions.set([
        { type: 'action', label: 'secondaryItem', icon: 'element-copy', action: () => {} }
      ]);
      preventIconsInDropdownMenus.set(true);

      await fixture.whenStable();
      await harness.toggleMobile();
      expect(
        await harness
          .getMobileMenu()
          .then(menu => menu.getItem('secondaryItem'))
          .then(item => item.hasIcon('element-copy'))
      ).toBe(false);
    });
  });

  it('should force mobile if no primary actions are provided', async () => {
    primaryActions.set([
      { type: 'action', label: 'primaryItem', icon: 'element-user', action: () => {} }
    ]);
    await fixture.whenStable();
    expect(await harness.isMobile()).toBe(false);
    primaryActions.set([]);
    await fixture.whenStable();
    expect(await harness.isMobile()).toBe(true);
  });
});
