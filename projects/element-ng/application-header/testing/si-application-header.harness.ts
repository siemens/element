/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentHarness } from '@angular/cdk/testing';

import { SiHeaderItemHarness } from './si-header-item.harness';
import { SiLaunchpadHarness } from './si-launchpad.harness';

export class SiApplicationHeaderHarness extends ComponentHarness {
  static hostSelector = 'si-application-header';

  private navigationToggle = this.locatorFor('[aria-label="Toggle navigation"]');
  private collapsibleActionsToggle = this.locatorFor('[aria-label="Toggle actions"]');
  private collapsibleActionsBadge = this.locatorForOptional(
    '[aria-label="Toggle actions"] .badge-dot'
  );
  private launchpadToggle = this.locatorForOptional('[aria-label="Launchpad"]');
  private backdrop = this.locatorForOptional('.modal-backdrop');

  async openNavigationMobile(): Promise<void> {
    return this.navigationToggle().then(toggle => toggle.click());
  }

  async isNavigationMobileOpen(): Promise<boolean> {
    return this.navigationToggle()
      .then(toggle => toggle.getAttribute('aria-expanded'))
      .then(expanded => expanded === 'true');
  }

  async openCollapsibleActions(): Promise<void> {
    return this.collapsibleActionsToggle().then(toggle => toggle.click());
  }

  async isCollapsibleActionsOpen(): Promise<boolean> {
    return this.collapsibleActionsToggle()
      .then(toggle => toggle.getAttribute('aria-expanded'))
      .then(expanded => expanded === 'true');
  }

  async hasCollapsibleActionsBadge(): Promise<boolean> {
    return this.collapsibleActionsBadge().then(badge => !!badge);
  }

  async getNavigationItem(text: string): Promise<SiHeaderItemHarness> {
    return this.locatorFor(SiHeaderItemHarness.inNavigationWithText(text))();
  }

  async getActionItem(text: string): Promise<SiHeaderItemHarness> {
    return this.locatorFor(SiHeaderItemHarness.inActionsWithText(text))();
  }

  async hasBackdrop(): Promise<boolean> {
    return this.backdrop().then(backdrop => !!backdrop);
  }

  async clickBackdrop(): Promise<void> {
    return this.backdrop().then(backdrop => backdrop!.click());
  }

  async hasLaunchpad(): Promise<boolean> {
    return this.launchpadToggle().then(toggle => !!toggle);
  }

  async openLaunchpad(): Promise<void> {
    return this.launchpadToggle().then(toggle => toggle!.click());
  }

  async getLaunchpad(): Promise<SiLaunchpadHarness | null> {
    return this.locatorForOptional(SiLaunchpadHarness)();
  }
}
