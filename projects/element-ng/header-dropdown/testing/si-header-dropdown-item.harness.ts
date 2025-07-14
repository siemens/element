/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

export class SiHeaderDropdownItemHarness extends ComponentHarness {
  static readonly hostSelector =
    'si-header-dropdown-item, a[si-header-dropdown-item], button[si-header-dropdown-item]';

  static withText(text: string): HarnessPredicate<SiHeaderDropdownItemHarness> {
    return new HarnessPredicate(SiHeaderDropdownItemHarness, {}).addOption(
      'text',
      text,
      (harness, filterValue) => HarnessPredicate.stringMatches(harness.getText(), filterValue)
    );
  }

  async getText(): Promise<string> {
    return this.host().then(host => host.text());
  }

  async click(): Promise<void> {
    return this.host().then(host => host.click());
  }
}
