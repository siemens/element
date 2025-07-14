/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { HarnessPredicate } from '@angular/cdk/testing';
import { SiHeaderDropdownTriggerHarness } from '@siemens/element-ng/header-dropdown/testing/si-header-dropdown-trigger.harness';

export class SiHeaderItemHarness extends SiHeaderDropdownTriggerHarness {
  static override readonly hostSelector = '[si-header-navigation-item], [si-header-action-item]';

  static inNavigationWithText(text: string): HarnessPredicate<SiHeaderItemHarness> {
    return new HarnessPredicate(SiHeaderItemHarness, { ancestor: '.header-navigation' }).add(
      'text',
      item => HarnessPredicate.stringMatches(item.getText(), text)
    );
  }

  static inActionsWithText(text: string): HarnessPredicate<SiHeaderItemHarness> {
    return new HarnessPredicate(SiHeaderItemHarness, { ancestor: '.header-actions' }).add(
      'text',
      item => HarnessPredicate.stringMatches(item.getText(), text)
    );
  }

  private title = this.locatorFor('.item-title');
  private badgeDot = this.locatorForOptional('.badge-dot');
  private badgeText = this.locatorForOptional('.badge-text');

  override async getText(): Promise<string> {
    const title = await this.title();
    return await title.text();
  }

  async hasBadgeDot(): Promise<boolean> {
    return this.badgeDot().then(dot => !!dot);
  }

  async getBadgeText(): Promise<string | undefined> {
    return this.badgeText().then(text => text?.text());
  }
}
