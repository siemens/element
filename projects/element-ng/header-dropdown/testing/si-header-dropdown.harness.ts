/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

import { SiHeaderDropdownItemHarness } from './si-header-dropdown-item.harness';
import { SiHeaderDropdownTriggerHarness } from './si-header-dropdown-trigger.harness';

export class SiHeaderDropdownHarness extends ComponentHarness {
  static readonly hostSelector = 'si-header-dropdown';

  static withId(id: string): HarnessPredicate<SiHeaderDropdownHarness> {
    return new HarnessPredicate(SiHeaderDropdownHarness, { selector: `#${id}` });
  }

  async isOpen(): Promise<boolean> {
    return this.host().then(host => host.hasClass('show'));
  }

  async getItem(item: string): Promise<SiHeaderDropdownItemHarness> {
    return this.locatorFor(SiHeaderDropdownItemHarness.withText(item))();
  }

  async getTrigger(item: string): Promise<SiHeaderDropdownTriggerHarness> {
    return this.locatorFor(SiHeaderDropdownTriggerHarness.withText(item))();
  }
}
