/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentHarness, parallel, TestKey } from '@angular/cdk/testing';

import { SiSelectListItemHarness } from './si-select-list-item.harness';

export abstract class SiSelectListBaseHarness extends ComponentHarness {
  async getItem(index: number): Promise<SiSelectListItemHarness> {
    return this.getAllItems().then(items => items[index]);
  }

  async getItemByText(text: string): Promise<SiSelectListItemHarness> {
    return this.locatorFor(SiSelectListItemHarness.with({ text }))();
  }

  async getAllItems(): Promise<SiSelectListItemHarness[]> {
    return this.locatorForAll(SiSelectListItemHarness)();
  }

  async getAllItemTexts(): Promise<string[]> {
    return this.getAllItems().then(items => parallel(() => items.map(item => item.getText())));
  }

  moveCursorDown(): Promise<void> {
    return this.sendKeys(TestKey.DOWN_ARROW);
  }

  moveCursorUp(): Promise<void> {
    return this.sendKeys(TestKey.UP_ARROW);
  }

  abstract sendKeys(...keys: (string | TestKey)[]): Promise<void>;
}
