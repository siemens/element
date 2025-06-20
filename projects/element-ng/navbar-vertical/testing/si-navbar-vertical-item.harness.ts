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

export interface SiNavbarVerticalItemHarnessFilters extends BaseHarnessFilters {
  label?: string;
}

export class SiNavbarVerticalItemHarness extends ComponentHarness {
  static hostSelector = '.dropdown-item, .navbar-vertical-item';

  static with(
    filters: SiNavbarVerticalItemHarnessFilters = {}
  ): HarnessPredicate<SiNavbarVerticalItemHarness> {
    return new HarnessPredicate(SiNavbarVerticalItemHarness, filters).addOption(
      'label',
      filters.label,
      (harness, label) => HarnessPredicate.stringMatches(harness.getLabel(), label)
    );
  }

  private readonly itemTitle = this.locatorFor('.item-title');

  async getLabel(): Promise<string> {
    return this.itemTitle()
      .then(title => title.text())
      .then(text => text.trim());
  }

  async click(): Promise<void> {
    return this.host().then(host => host.click());
  }

  async isExpanded(): Promise<boolean> {
    return this.host()
      .then(host => host.getAttribute('aria-expanded'))
      .then(value => value === 'true');
  }

  async isFlyout(): Promise<boolean> {
    const groupId = await this.host().then(host => host.getAttribute('aria-controls'));
    return this.documentRootLocatorFactory()
      .locatorFor(`#${groupId}`)()
      .then(flyout => flyout.hasClass('dropdown-menu'));
  }

  async isActive(): Promise<boolean> {
    return this.host().then(host => host.hasClass('active'));
  }

  async getChildren(
    filter?: SiNavbarVerticalItemHarnessFilters
  ): Promise<SiNavbarVerticalItemHarness[]> {
    const groupId = await this.host().then(host => host.getAttribute('aria-controls'));
    return this.documentRootLocatorFactory().locatorForAll(
      SiNavbarVerticalItemHarness.with({ ...filter, ancestor: `#${groupId}` })
    )();
  }

  async getChildNames(filter?: SiNavbarVerticalItemHarnessFilters): Promise<string[]> {
    return this.getChildren(filter).then(items =>
      parallel(() => items.map(item => item.getLabel()))
    );
  }
}
