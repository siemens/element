/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentHarness } from '@angular/cdk/testing';

import { SiLaunchpadAppHarness } from './si-launchpad-app.harness';
import { SiLaunchpadCategoryHarness } from './si-launchpad-category.harness';

export class SiLaunchpadHarness extends ComponentHarness {
  static readonly hostSelector = 'si-launchpad-factory';

  private toggleButton = this.locatorForOptional('.dropdown-toggle');

  async getCategory(name: string): Promise<SiLaunchpadCategoryHarness> {
    return this.locatorFor(SiLaunchpadCategoryHarness.withName(name))();
  }

  async getFavoriteCategory(): Promise<SiLaunchpadCategoryHarness> {
    return this.getCategory('Favorite apps');
  }

  async getCategories(): Promise<SiLaunchpadCategoryHarness[]> {
    return this.locatorForAll(SiLaunchpadCategoryHarness)();
  }

  async getApp(name: string): Promise<SiLaunchpadAppHarness> {
    return this.locatorFor(SiLaunchpadAppHarness.withName(name))();
  }

  async hasToggle(): Promise<boolean> {
    return this.toggleButton().then(toggle => !!toggle);
  }

  async toggleMore(): Promise<void> {
    return this.toggleButton().then(toggle => toggle!.click());
  }
}
