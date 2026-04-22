/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ComponentHarness, parallel } from '@angular/cdk/testing';

import {
  SiNavbarVerticalNextItemHarness,
  SiNavbarVerticalNextItemHarnessFilters
} from './si-navbar-vertical-next-item.harness';

export class SiNavbarVerticalNextHarness extends ComponentHarness {
  static hostSelector = 'si-navbar-vertical-next';

  private readonly collapseToggle = this.locatorFor('.collapse-toggle button');
  private readonly searchButton = this.locatorFor('si-navbar-vertical-next-search .btn-search');
  private readonly searchInput = this.locatorFor('si-navbar-vertical-next-search input');

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
    filter?: SiNavbarVerticalNextItemHarnessFilters
  ): Promise<SiNavbarVerticalNextItemHarness[]> {
    return this.locatorForAll(
      SiNavbarVerticalNextItemHarness.with({
        ...filter,
        selector: 'si-navbar-vertical-next-items > .navbar-vertical-item'
      })
    )();
  }

  async findItemNames(filter?: SiNavbarVerticalNextItemHarnessFilters): Promise<string[]> {
    return this.findItems(filter).then(items => parallel(() => items.map(item => item.getLabel())));
  }

  async findItemByLabel(label: string): Promise<SiNavbarVerticalNextItemHarness> {
    return this.locatorFor(SiNavbarVerticalNextItemHarness.with({ label }))();
  }

  async clickSearch(): Promise<void> {
    return this.searchButton().then(searchButton => searchButton.click());
  }

  async search(query: string): Promise<void> {
    return this.searchInput().then(searchInput => searchInput.sendKeys(query));
  }
}
