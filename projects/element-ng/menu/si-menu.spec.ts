/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { ComponentHarness, HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuItem } from '@siemens/element-ng/common';
import { SiLinkActionService } from '@siemens/element-ng/link';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

import { SiMenuModule } from './si-menu.module';
import { SiMenuItemHarness } from './testing/si-menu.harness';

class ButtonHarness extends ComponentHarness {
  static hostSelector = 'button';
  async click(): Promise<void> {
    return (await this.host()).click();
  }
}

@Component({
  template: `
    <button class="btn" type="button" [cdkMenuTriggerFor]="menu">Toggle Menu</button>
    <ng-template #menu>
      <si-menu-factory actionParam="action!" [items]="items" />
    </ng-template>
  `,
  imports: [SiMenuModule, SiTranslateModule, CdkMenuTrigger]
})
class TestLegacyObjectComponent {
  items: MenuItem[] = [
    { title: 'header', isHeading: true },
    { title: 'first item', disabled: true },
    {
      type: 'check',
      title: 'check',
      selectionState: 'check',
      action: () =>
        (this.items[2].selectionState = this.items[2].selectionState === 'check' ? '' : 'check')
    },
    {
      type: 'radio',
      icon: 'element-test-icon',
      selectionState: '',
      title: 'radio1',
      action: () => {
        this.items[3].selectionState = 'radio';
        this.items[4].selectionState = '';
      }
    },
    {
      type: 'radio',
      title: 'radio2',
      selectionState: 'radio',
      action: () => {
        this.items[3].selectionState = '';
        this.items[4].selectionState = 'radio';
      }
    },
    {
      title: 'children',
      badge: 'badged',
      items: [{ title: 'child1' }, { title: 'child2' }]
    },
    { title: 'action', action: () => {} },
    { title: 'actionService', type: 'check', action: 'action' }
  ];
}

// preparing for <si-context-menu-object> with new item type, which should have the same test scenario
const withObjectType = <ItemType extends MenuItem, ComponentType extends { items: ItemType[] }>(
  siContextMenuType: 'legacy-object',
  componentType: new (...args: any) => ComponentType
): void => {
  describe(`with ${siContextMenuType}`, () => {
    let fixture: ComponentFixture<ComponentType>;
    let loader: HarnessLoader;
    let rootLoader: HarnessLoader;

    const toggle = async (): Promise<void> => {
      await (await loader.getHarness(ButtonHarness)).click();
    };

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [{ provide: SiLinkActionService, useValue: jasmine.createSpyObj(['emit']) }]
      });
      fixture = TestBed.createComponent(componentType);
      loader = TestbedHarnessEnvironment.loader(fixture);
      rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    });

    it('should toggle checkbox', async () => {
      const checkboxIndex = 2;
      const spy = spyOn(
        fixture.componentInstance.items[checkboxIndex] as { action: (action?: any) => void },
        'action'
      ).and.callThrough();

      await toggle();
      const checkMenuItem = await rootLoader.getHarness(SiMenuItemHarness.with({ text: 'check' }));
      expect(await checkMenuItem.isChecked()).toBeTrue();
      await checkMenuItem.click();
      await toggle();
      expect(
        await (await rootLoader.getHarness(SiMenuItemHarness.with({ text: 'check' }))).isChecked()
      ).toBeFalse();
      expect(spy).toHaveBeenCalledWith('action!');
    });

    it('should toggle radio', async () => {
      await toggle();
      let radioItems = await rootLoader.getAllHarnesses(
        SiMenuItemHarness.with({ text: /radio\d+/ })
      );
      expect(await radioItems[0].isChecked()).toBeFalse();
      expect(await radioItems[1].isChecked()).toBeTrue();

      await radioItems[0].click();
      await toggle();
      radioItems = await rootLoader.getAllHarnesses(SiMenuItemHarness.with({ text: /radio\d+/ }));
      expect(await radioItems[0].isChecked()).toBeTrue();
      expect(await radioItems[1].isChecked()).toBeFalse();
    });

    it('should have submenu', async () => {
      await toggle();
      const menuItem = await rootLoader.getHarness(SiMenuItemHarness.with({ text: 'children' }));
      expect(await menuItem.hasSubmenu()).toBeTrue();
      await menuItem.hover();

      const menu = await menuItem.getSubmenu();
      expect(await menu?.getItemTexts()).toEqual(['child1', 'child2']);
    });

    it('should have icon', async () => {
      await toggle();
      const menuItem = await rootLoader.getHarness(SiMenuItemHarness.with({ text: 'radio1' }));
      expect(await menuItem.hasIcon('element-test-icon')).toBeTrue();
    });

    it('should have badge', async () => {
      await toggle();
      const menuItem = await rootLoader.getHarness(SiMenuItemHarness.with({ text: 'children' }));
      expect(await menuItem.getBadgeText()).toBe('badged');
    });

    it('should be disabled', async () => {
      await toggle();
      const menuItem = await rootLoader.getHarness(SiMenuItemHarness.with({ text: 'first item' }));
      expect(await menuItem.isDisabled()).toBeTrue();
    });

    it('should update on object mutation', async () => {
      const disabledIndex = 1;
      await toggle();
      const menuItem = await rootLoader.getHarness(SiMenuItemHarness.with({ text: 'first item' }));
      expect(await menuItem.isDisabled()).toBeTrue();
      if (!fixture.componentInstance.items[disabledIndex].type) {
        fixture.componentInstance.items[disabledIndex].disabled = false;
      }
      expect(await menuItem.isDisabled()).toBeFalse();
    });

    it('should trigger an action', async () => {
      const actionIndex = 6;
      const spy = spyOn(
        fixture.componentInstance.items[actionIndex] as { action: (action?: any) => void },
        'action'
      );
      await toggle();
      const menuItem = await rootLoader.getHarness(SiMenuItemHarness.with({ text: 'action' }));
      await menuItem.click();
      expect(spy).toHaveBeenCalledWith('action!');
    });

    it('should trigger action service', async () => {
      const actionIndex = 7;
      const actionService = TestBed.inject(
        SiLinkActionService
      ) as jasmine.SpyObj<SiLinkActionService>;

      await toggle();
      const menuItem = await rootLoader.getHarness(
        SiMenuItemHarness.with({ text: 'actionService' })
      );
      await menuItem.click();
      expect(actionService.emit).toHaveBeenCalledWith(
        fixture.componentInstance.items[actionIndex],
        'action!'
      );
    });
  });
};

describe('SiContextMenu', () => {
  withObjectType('legacy-object', TestLegacyObjectComponent);
});
