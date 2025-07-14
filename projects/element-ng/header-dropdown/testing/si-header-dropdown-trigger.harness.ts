/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

import { SiHeaderDropdownHarness } from './si-header-dropdown.harness';

export class SiHeaderDropdownTriggerHarness extends ComponentHarness {
  static readonly hostSelector: string = '.dropdown-toggle';

  static withText(text: string): HarnessPredicate<SiHeaderDropdownTriggerHarness> {
    return new HarnessPredicate(SiHeaderDropdownTriggerHarness, {}).addOption(
      'text',
      text,
      (harness, filterValue) => HarnessPredicate.stringMatches(harness.getText(), filterValue)
    );
  }

  async getText(): Promise<string> {
    return this.host().then(host => host.text());
  }

  async toggle(): Promise<void> {
    return this.host().then(host => host.click());
  }

  async getDropdown(): Promise<SiHeaderDropdownHarness> {
    return this.documentRootLocatorFactory().locatorFor(
      SiHeaderDropdownHarness.withId(await this.getAriaControls())
    )();
  }

  async isOpen(): Promise<boolean> {
    return this.getDropdown().then(dropdown => dropdown.isOpen());
  }

  async isDesktop(): Promise<boolean> {
    return this.documentRootLocatorFactory()
      .locatorForOptional(`[aria-owns="${await this.getAriaControls()}"]`)()
      .then(anchor => !!anchor);
  }

  private async getAriaControls(): Promise<string> {
    return this.host()
      .then(host => host.getAttribute('aria-controls'))
      .then(attr => attr!);
  }
}
