/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

import { SiLaunchpadAppHarness } from './si-launchpad-app.harness';

export class SiLaunchpadCategoryHarness extends ComponentHarness {
  static readonly hostSelector = '.apps-scroll > div';

  static withName(name: string): HarnessPredicate<SiLaunchpadCategoryHarness> {
    return new HarnessPredicate(SiLaunchpadCategoryHarness, {}).add('name', item =>
      HarnessPredicate.stringMatches(item.getName(), name)
    );
  }

  private name = this.locatorForOptional('.si-title-1');

  async getName(): Promise<string | null> {
    return this.name().then(name => name?.text() ?? null);
  }

  async getApps(): Promise<SiLaunchpadAppHarness[]> {
    return this.locatorForAll(SiLaunchpadAppHarness)();
  }

  async getApp(name: string): Promise<SiLaunchpadAppHarness> {
    return this.locatorFor(SiLaunchpadAppHarness.withName(name))();
  }
}
