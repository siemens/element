/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ComponentHarness, TestElement } from '@angular/cdk/testing';

export class SiTabContentHarness extends ComponentHarness {
  static hostSelector = 'si-tab-content';

  private readonly tabPanel = this.locatorForOptional('[role="tabpanel"]');

  async getTabPanel(): Promise<TestElement | null> {
    return this.tabPanel();
  }

  async hasTabPanel(): Promise<boolean> {
    return (await this.tabPanel()) !== null;
  }

  async getTabPanelId(): Promise<string | null> {
    return this.tabPanel().then(panel => panel?.getAttribute('id') ?? null);
  }

  async getTabPanelLabelledBy(): Promise<string | null> {
    return this.tabPanel().then(panel => panel?.getAttribute('aria-labelledby') ?? null);
  }

  async getTabPanelText(): Promise<string> {
    return this.tabPanel().then(panel => panel?.text() ?? '');
  }
}
