/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentHarness } from '@angular/cdk/testing';

export class SiActionCardHarness extends ComponentHarness {
  /** @defaultValue 'button[si-card]' */
  static hostSelector = 'button[si-card]';

  async clickActionButton(): Promise<void> {
    (await this.host()).click();
  }

  async isSelected(): Promise<boolean> {
    return (await this.host()).hasClass('selected');
  }
}
