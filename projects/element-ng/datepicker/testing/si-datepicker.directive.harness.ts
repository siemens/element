/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentHarness, TestKey } from '@angular/cdk/testing';

export class SiDatepickerDirectiveComponentHarness extends ComponentHarness {
  static hostSelector = 'input[sidatepicker]';

  /**
   * Focuses the input and returns a promise that indicates when the
   * action is complete.
   */
  async focus(): Promise<SiDatepickerDirectiveComponentHarness> {
    const host = await this.host();
    await host.focus();
    return this;
  }

  async clear(): Promise<SiDatepickerDirectiveComponentHarness> {
    const input = await this.host();
    await input.clear();
    return this;
  }
  /**
   * Enters text or send keyboard interaction to input and returns a promise that
   * indicates when the action is complete.
   */
  async sendKeys(...keys: (string | TestKey)[]): Promise<void> {
    return (await this.host()).sendKeys(...keys);
  }
}
