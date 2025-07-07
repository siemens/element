/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentHarness } from '@angular/cdk/testing';

export class SiActionCardHarness extends ComponentHarness {
  /** @defaultValue 'button[si-action-card]' */
  static hostSelector = 'button[si-action-card]';

  async clickActionButton(): Promise<void> {
    (await this.host()).click();
  }

  async isSelected(): Promise<boolean> {
    return (await this.host()).hasClass('selected');
  }
}
