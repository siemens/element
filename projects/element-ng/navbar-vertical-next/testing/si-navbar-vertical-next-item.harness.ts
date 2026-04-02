/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  BaseHarnessFilters,
  ComponentHarness,
  HarnessPredicate,
  parallel
} from '@angular/cdk/testing';

export interface SiNavbarVerticalNextItemHarnessFilters extends BaseHarnessFilters {
  label?: string;
}

export class SiNavbarVerticalNextItemHarness extends ComponentHarness {
  static hostSelector = '.dropdown-item, .navbar-vertical-item';

  static with(
    filters: SiNavbarVerticalNextItemHarnessFilters = {}
  ): HarnessPredicate<SiNavbarVerticalNextItemHarness> {
    return new HarnessPredicate(SiNavbarVerticalNextItemHarness, filters).addOption(
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
      .locatorForOptional(`#${groupId} .dropdown-menu`)()
      .then(flyout => !!flyout);
  }

  async isActive(): Promise<boolean> {
    return this.host().then(host => host.hasClass('active'));
  }

  async getChildren(
    filter?: SiNavbarVerticalNextItemHarnessFilters
  ): Promise<SiNavbarVerticalNextItemHarness[]> {
    const groupId = await this.host().then(host => host.getAttribute('aria-controls'));
    return this.documentRootLocatorFactory().locatorForAll(
      SiNavbarVerticalNextItemHarness.with({ ...filter, ancestor: `#${groupId}` })
    )();
  }

  async getChildNames(filter?: SiNavbarVerticalNextItemHarnessFilters): Promise<string[]> {
    return this.getChildren(filter).then(items =>
      parallel(() => items.map(item => item.getLabel()))
    );
  }
}
