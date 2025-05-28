/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import {
  BaseHarnessFilters,
  ComponentHarness,
  HarnessPredicate,
  parallel
} from '@angular/cdk/testing';

export interface SiMenuHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the text displayed in the menu. */
  text?: string | RegExp;
  /** Filter based on the si-menu-next id. */
  id?: string;
}

export class SiMenuHarness extends ComponentHarness {
  static hostSelector = 'si-menu';

  static with(filters: SiMenuHarnessFilters = {}): HarnessPredicate<SiMenuHarness> {
    return new HarnessPredicate(SiMenuHarness, filters).addOption('id', filters.id, (harness, id) =>
      HarnessPredicate.stringMatches(harness.getId(), id)
    );
  }

  async getItems(): Promise<SiMenuItemHarness[]> {
    return this.locatorForAll(SiMenuItemHarness.with())();
  }

  async getItemTexts(): Promise<string[]> {
    const items = await this.getItems();
    return await parallel(() => items.map(i => i.getText()));
  }

  getItem(text: string): Promise<SiMenuItemHarness> {
    return this.locatorFor(SiMenuItemHarness.with({ text }))();
  }

  private async getId(): Promise<string | null> {
    return (await this.host())?.getAttribute('id');
  }
}

export class SiMenuItemHarness extends ComponentHarness {
  static hostSelector = 'si-menu-item-radio, si-menu-item-checkbox, si-menu-item, [si-menu-item]';
  private readonly text = this.locatorForOptional('span.item-title');
  private readonly icon = this.locatorForOptional('si-icon-next div');
  private readonly badge = this.locatorForOptional('span.badge');
  private readonly children = this.locatorForOptional('.item-end .submenu');

  static with(filters: SiMenuHarnessFilters = {}): HarnessPredicate<SiMenuItemHarness> {
    return new HarnessPredicate(SiMenuItemHarness, filters).addOption(
      'text',
      filters.text,
      (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text)
    );
  }

  private async getAttribute(attributeName: string): Promise<string | null> {
    return (await this.host()).getAttribute(attributeName);
  }

  async hasIcon(iconClass: string): Promise<boolean> {
    return (await this.icon())?.hasClass(iconClass) ?? false;
  }

  async hasSubmenu(): Promise<boolean> {
    return (await this.children()) !== null;
  }

  async getBadgeText(): Promise<string | null> {
    return (await this.badge())?.text() ?? null;
  }

  async isDisabled(): Promise<boolean> {
    return (await this.getAttribute('aria-disabled')) === 'true';
  }

  async isCheckItem(): Promise<boolean> {
    return (await this.getAttribute('role')) === 'menuitemcheckbox';
  }

  async isRadioItem(): Promise<boolean> {
    return (await this.getAttribute('role')) === 'menuitemradio';
  }

  async isChecked(): Promise<boolean> {
    return (await this.getAttribute('aria-checked')) === 'true';
  }

  async click(): Promise<void> {
    await (await this.host())?.click();
  }

  async getText(): Promise<string> {
    return (await this.text())?.text() ?? '';
  }

  async getSubmenu(): Promise<SiMenuHarness> {
    const ariaControls = await this.getAttribute('aria-controls');
    return this.documentRootLocatorFactory().locatorFor(
      SiMenuHarness.with({
        id: ariaControls!
      })
    )();
  }

  async hover(): Promise<void> {
    await (await this.host()).hover();
  }
}
