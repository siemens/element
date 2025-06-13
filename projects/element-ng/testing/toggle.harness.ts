/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ComponentHarness } from '@angular/cdk/testing';

export class ToggleHarness extends ComponentHarness {
  static hostSelector = 'input[type="checkbox"][role="switch"]';

  /** Whether the toggle is checked. */
  async isChecked(): Promise<boolean> {
    return (await this.host()).getProperty('checked');
  }

  /** Toggle the checked state of the slide-toggle. */
  async toggle(): Promise<void> {
    return (await this.host()).click();
  }
}
