/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

export interface SiSelectListItemFilter extends BaseHarnessFilters {
  text?: string;
  active?: boolean;
}

export class SiSelectListItemHarness extends ComponentHarness {
  static hostSelector = '.dropdown-item';

  static with(filter: SiSelectListItemFilter): HarnessPredicate<SiSelectListItemHarness> {
    return new HarnessPredicate(SiSelectListItemHarness, filter)
      .addOption('text', filter.text, (harness, text) =>
        HarnessPredicate.stringMatches(harness.getText(), text)
      )
      .addOption('active', filter.active, (harness, active) =>
        active ? harness.isActive() : Promise.resolve(true)
      );
  }

  async getText(): Promise<string> {
    return this.host().then(host => host.text());
  }

  async click(): Promise<void> {
    await this.host().then(host => host.click());
  }

  async isActive(): Promise<boolean> {
    return this.host()
      .then(host => host.getProperty<DOMTokenList>('classList'))
      .then(classes => classes.contains('active'));
  }
}
