/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { booleanAttribute, Component, Input } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { MenuItem } from '@spike-rabbit/element-ng/menu';

import { SiContentActionBarComponent } from './si-content-action-bar.component';
import { ContentActionBarMainItem, ViewType } from './si-content-action-bar.model';
import { SiContentActionBarHarness } from './testing/si-content-action-bar.harness';

@Component({
  imports: [SiContentActionBarComponent],
  template: `
    <div class="d-flex">
      <si-content-action-bar
        #ref
        class="ms-auto"
        [primaryActions]="primaryActions"
        [secondaryActions]="secondaryActions"
        [viewType]="viewType"
        [preventIconsInDropdownMenus]="preventIconsInDropdownMenus"
      />
    </div>
  `
})
class TestComponent {
  @Input() primaryActions: ContentActionBarMainItem[] = [];
  @Input() secondaryActions: MenuItem[] = [];
  @Input() viewType: ViewType = 'expanded';
  @Input({ transform: booleanAttribute }) preventIconsInDropdownMenus = false;
}

describe('SiContentActionBarComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let loader: HarnessLoader;
  let harness: SiContentActionBarHarness;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, TestComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    harness = await loader.getHarness(SiContentActionBarHarness);
  });

  it('should set primary actions', async () => {
    component.primaryActions = [
      { type: 'link', label: 'Create', href: '#' },
      { type: 'router-link', label: 'Route me', routerLink: '/' },
      { type: 'group', label: 'Save', children: [] },
      { type: 'action', label: 'Delete', action: () => alert('Delete') }
    ];

    expect(await harness.getPrimaryActionTexts()).toEqual(['Create', 'Route me', 'Save', 'Delete']);
  });

  it('should set secondary actions', async () => {
    component.secondaryActions = [
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
    ];

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
    component.viewType = 'collapsible';
    component.primaryActions = [
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
    ];

    expect(await harness.isPrimaryExpanded()).toBeFalse();
    await harness.togglePrimary();
    expect(await harness.isPrimaryExpanded()).toBeTrue();
  });

  it('should disable menu item by disabled attribute', async () => {
    component.viewType = 'expanded';
    component.primaryActions = [
      { type: 'action', label: 'Item', disabled: true, action: () => {} }
    ];

    expect(await harness.getPrimaryAction('Item').then(item => item.isDisabled())).toBeTrue();
  });

  it('should call action on item click', async () => {
    const actionSpy = jasmine.createSpy('clickSpy');
    component.viewType = 'expanded';
    component.primaryActions = [{ type: 'action', label: 'Item', action: actionSpy }];

    await harness.getPrimaryAction('Item').then(item => item.click());
    expect(actionSpy).toHaveBeenCalled();
  });

  describe('#preventIconsInDropdownMenus', () => {
    it('should show primary action icon', async () => {
      component.primaryActions = [
        { type: 'action', label: 'primaryItem', icon: 'element-user', action: () => {} }
      ];
      component.preventIconsInDropdownMenus = true;

      expect(
        await harness.getPrimaryAction('primaryItem').then(item => item.hasIcon('element-user'))
      ).toBeTrue();
    });

    it('should show primary action icon in in menu', async () => {
      component.primaryActions = [
        { type: 'action', label: 'primaryItem', icon: 'element-user', action: () => {} }
      ];
      component.viewType = 'mobile';

      await harness.toggleMobile();
      expect(
        await harness
          .getMobileMenu()
          .then(menu => menu.getItem('primaryItem'))
          .then(item => item.hasIcon('element-user'))
      ).toBeTrue();
    });

    it('should not show primary action icon in menus with mobile view', async () => {
      component.primaryActions = [
        { type: 'action', label: 'primaryItem', icon: 'element-user', action: () => {} }
      ];
      component.viewType = 'mobile';
      component.preventIconsInDropdownMenus = true;

      await harness.toggleMobile();
      expect(
        await harness
          .getMobileMenu()
          .then(menu => menu.getItem('primaryItem'))
          .then(item => item.hasIcon('element-user'))
      ).toBeFalse();
    });

    it('should show secondary action icon in menu with expanded view', async () => {
      component.viewType = 'expanded';
      component.primaryActions = [
        { type: 'action', label: 'primaryItem', icon: 'element-user', action: () => {} }
      ];
      component.secondaryActions = [
        { type: 'action', label: 'secondaryItem', icon: 'element-copy', action: () => {} }
      ];

      await harness.toggleSecondary();
      expect(
        await harness
          .getSecondaryMenu()
          .then(menu => menu.getItem('secondaryItem'))
          .then(item => item.hasIcon('element-copy'))
      ).toBeTrue();
    });

    it('should not show secondary action icon in menus with expanded view', async () => {
      component.viewType = 'expanded';
      component.primaryActions = [
        { type: 'action', label: 'primaryItem', icon: 'element-user', action: () => {} }
      ];
      component.secondaryActions = [
        { type: 'action', label: 'secondaryItem', icon: 'element-copy', action: () => {} }
      ];
      component.preventIconsInDropdownMenus = true;

      await harness.toggleMobile();
      expect(
        await harness
          .getMobileMenu()
          .then(menu => menu.getItem('secondaryItem'))
          .then(item => item.hasIcon('element-copy'))
      ).toBeFalse();
    });
  });

  it('should force mobile if no primary actions are provided', async () => {
    component.primaryActions = [
      { type: 'action', label: 'primaryItem', icon: 'element-user', action: () => {} }
    ];
    expect(await harness.isMobile()).toBeFalse();
    component.primaryActions = [];
    expect(await harness.isMobile()).toBeTrue();
  });
});
