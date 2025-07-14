/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentHarness, parallel, TestElement } from '@angular/cdk/testing';

import { SiMenuHarness, SiMenuItemHarness } from '../../menu/testing/si-menu.harness';

export class SiContentActionBarHarness extends ComponentHarness {
  static hostSelector = 'si-content-action-bar';

  readonly getPrimaryActions = this.locatorForAll(SiMenuItemHarness);

  private readonly getSecondaryToggle = this.locatorForOptional(
    'button[si-content-action-bar-toggle].cdk-menu-trigger'
  );
  private readonly getPrimaryToggle = this.locatorForOptional(
    'button[si-content-action-bar-toggle]:not(.cdk-menu-trigger)'
  );
  private readonly getAutoMobileToggle = this.locatorForOptional(
    'button[si-content-action-bar-toggle][siAutoCollapsableListOverflowItem]'
  );
  private readonly getForcedMobileToggle = this.locatorForOptional(
    ':scope > button[si-content-action-bar-toggle]:last-child'
  );
  private collapsibleListItem = this.locatorFor('[siAutoCollapsableListItem]');

  private async getMobileToggle(): Promise<TestElement | null> {
    const [forced, mobile] = await parallel(() => [
      this.getForcedMobileToggle(),
      this.getAutoMobileToggle()
    ]);
    return forced ?? mobile;
  }

  async getPrimaryActionTexts(): Promise<string[]> {
    return this.getPrimaryActions().then(items =>
      parallel(() => items.map(item => item.getText()))
    );
  }

  async getPrimaryAction(text: string): Promise<SiMenuItemHarness> {
    return this.locatorFor(SiMenuItemHarness.with({ text }))();
  }

  async isPrimaryExpanded(): Promise<boolean> {
    return this.collapsibleListItem()
      .then(item => item.getCssValue('visibility'))
      .then(value => value === 'visible');
  }

  async togglePrimary(): Promise<void> {
    return this.getPrimaryToggle().then(toggle => toggle!.click());
  }

  async toggleSecondary(): Promise<void> {
    return this.getSecondaryToggle().then(toggle => toggle!.click());
  }

  async toggleMobile(): Promise<void> {
    return this.getMobileToggle().then(toggle => toggle!.click());
  }

  async getSecondaryMenu(): Promise<SiMenuHarness> {
    return this.documentRootLocatorFactory().locatorFor(
      SiMenuHarness.with({
        id: (await this.getSecondaryToggle().then(toggle => toggle!.getAttribute('aria-controls')))!
      })
    )();
  }

  async getMobileMenu(): Promise<SiMenuHarness> {
    return this.documentRootLocatorFactory().locatorFor(
      SiMenuHarness.with({
        id: (await this.getMobileToggle().then(toggle => toggle!.getAttribute('aria-controls')))!
      })
    )();
  }

  async isMobile(): Promise<boolean> {
    return this.getMobileToggle()
      .then(toggle => toggle?.getCssValue('visibility'))
      .then(value => value !== 'hidden');
  }
}
