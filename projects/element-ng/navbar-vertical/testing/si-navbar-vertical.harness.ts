/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentHarness, parallel } from '@angular/cdk/testing';

import {
  SiNavbarVerticalItemHarness,
  SiNavbarVerticalItemHarnessFilters
} from './si-navbar-vertical-item.harness';

export class SiNavbarVerticalHarness extends ComponentHarness {
  static hostSelector = 'si-navbar-vertical';

  private readonly collapseToggle = this.locatorFor('.collapse-toggle button');
  private readonly searchButton = this.locatorFor('.btn-search');
  private readonly searchInput = this.locatorFor('si-search-bar input');

  async toggleCollapse(): Promise<void> {
    return this.collapseToggle().then(toggle => toggle.click());
  }

  async isCollapsed(): Promise<boolean> {
    return this.collapseToggle()
      .then(host =>
        parallel(() => [host.getAttribute('aria-expanded'), host.getAttribute('aria-label')])
      )
      .then(([value, text]) => value === 'false' && text === 'Expand');
  }

  async isExpanded(): Promise<boolean> {
    return this.collapseToggle()
      .then(host =>
        parallel(() => [host.getAttribute('aria-expanded'), host.getAttribute('aria-label')])
      )
      .then(([value, text]) => value === 'true' && text === 'Collapse');
  }

  async findItems(
    filter?: SiNavbarVerticalItemHarnessFilters
  ): Promise<SiNavbarVerticalItemHarness[]> {
    return this.locatorForAll(
      SiNavbarVerticalItemHarness.with({
        ...filter,
        selector:
          '.nav-scroll > .navbar-vertical-item, si-navbar-vertical-item-legacy > .navbar-vertical-item, si-navbar-vertical-item-legacy > .link-with-items > .navbar-vertical-item'
      })
    )();
  }

  async findItemNames(filter?: SiNavbarVerticalItemHarnessFilters): Promise<string[]> {
    return this.findItems(filter).then(items => parallel(() => items.map(item => item.getLabel())));
  }

  async findItemByLabel(label: string): Promise<SiNavbarVerticalItemHarness> {
    return this.locatorFor(SiNavbarVerticalItemHarness.with({ label }))();
  }

  async clickSearch(): Promise<void> {
    return this.searchButton().then(searchButton => searchButton.click());
  }

  async search(query: string): Promise<void> {
    return this.searchInput().then(searchInput => searchInput.sendKeys(query));
  }
}
