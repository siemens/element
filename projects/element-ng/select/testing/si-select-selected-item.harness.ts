/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ComponentHarness } from '@angular/cdk/testing';

export class SiSelectSelectedItemHarness extends ComponentHarness {
  static hostSelector = 'si-select-option';

  async getText(): Promise<string> {
    return this.locatorFor('span')().then(element => element.text());
  }

  async getIcon(): Promise<string | undefined> {
    return this.locatorFor('.icon div')()
      .then(element => element.getProperty<DOMTokenList>('classList'))
      .then(classes => Array.from(classes).find(className => className.startsWith('element-')));
  }
}
