/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

export interface SiSelectListActionFilter extends BaseHarnessFilters {
  text?: string;
}

export class SiSelectListActionHarness extends ComponentHarness {
  static hostSelector = 'button[siselectaction]';

  static with(filter: SiSelectListActionFilter): HarnessPredicate<SiSelectListActionHarness> {
    return new HarnessPredicate(SiSelectListActionHarness, filter).addOption(
      'text',
      filter.text,
      (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text)
    );
  }

  async click(): Promise<void> {
    await this.host().then(host => host.click());
  }

  /** Gets the button text. */
  async getText(): Promise<string> {
    return (await this.host()).text();
  }
}
