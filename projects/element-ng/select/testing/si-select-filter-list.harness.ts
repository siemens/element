/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { HarnessPredicate, TestKey } from '@angular/cdk/testing';

import { SiSelectListBaseHarness } from './si-select-list-base.harness';

export class SiSelectFilterListHarness extends SiSelectListBaseHarness {
  static hostSelector = 'si-select-list-has-filter';

  static with(id: string): HarnessPredicate<SiSelectFilterListHarness> {
    return new HarnessPredicate(SiSelectFilterListHarness, { selector: `#${CSS.escape(id)}` });
  }

  private readonly input = this.locatorFor('input');

  async sendKeys(...keys: (string | TestKey)[]): Promise<void> {
    return this.input().then(input => input.sendKeys(...keys));
  }

  async clear(): Promise<void> {
    return this.input().then(input => input.clear());
  }
}
