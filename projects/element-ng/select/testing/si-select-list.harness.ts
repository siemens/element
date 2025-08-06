/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { HarnessPredicate, TestKey } from '@angular/cdk/testing';
import { SiSelectListBaseHarness } from '@spike-rabbit/element-ng/select/testing/si-select-list-base.harness';

export class SiSelectListHarness extends SiSelectListBaseHarness {
  static hostSelector = '.cdk-listbox';

  static with(id: string): HarnessPredicate<SiSelectListHarness> {
    return new HarnessPredicate(SiSelectListHarness, { selector: `#${CSS.escape(id)}` });
  }

  async sendKeys(...keys: (string | TestKey)[]): Promise<void> {
    return this.host().then(host => host.sendKeys(...keys));
  }
}
