/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

export class SiLaunchpadAppHarness extends ComponentHarness {
  static readonly hostSelector = 'a[si-launchpad-app]';

  static withName(name: string): HarnessPredicate<SiLaunchpadAppHarness> {
    return new HarnessPredicate(SiLaunchpadAppHarness, {}).add('name', item =>
      HarnessPredicate.stringMatches(item.getName(), name)
    );
  }

  private name = this.locatorFor('[app-name]');
  private favorite = this.locatorFor('.favorite-icon');

  async getName(): Promise<string> {
    return this.name().then(name => name.text());
  }

  async isFavorite(): Promise<boolean> {
    return this.favorite().then(favorite =>
      favorite.getProperty('classList').then(classList => classList.contains('is-favorite'))
    );
  }

  async toggleFavorite(): Promise<void> {
    return this.favorite().then(favorite => favorite.click());
  }
}
