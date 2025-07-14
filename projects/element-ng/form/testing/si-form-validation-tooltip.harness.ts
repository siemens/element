/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentHarness, TestKey } from '@angular/cdk/testing';

export class SiFormValidationTooltipHarness extends ComponentHarness {
  static readonly hostSelector = 'input';

  async hover(): Promise<void> {
    this.host().then(host => host.hover());
  }

  async mouseAway(): Promise<void> {
    this.host().then(host => host.mouseAway());
  }

  async focus(): Promise<void> {
    this.host().then(host => host.focus());
  }

  async blur(): Promise<void> {
    this.host().then(host => host.blur());
  }

  async sendKeys(...keys: (string | TestKey)[]): Promise<void> {
    await this.host().then(host => host.sendKeys(...keys));
  }

  async getTooltip(): Promise<string | undefined> {
    return this.host()
      .then(host => host.getAttribute('aria-describedby'))
      .then(describedBy =>
        this.documentRootLocatorFactory().locatorForOptional(`#${describedBy}`)()
      )
      .then(element => element?.text());
  }
}
