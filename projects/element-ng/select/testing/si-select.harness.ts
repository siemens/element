/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ComponentHarness, parallel, TestKey } from '@angular/cdk/testing';

import { SiSelectFilterListHarness } from './si-select-filter-list.harness';
import {
  SiSelectListActionFilter,
  SiSelectListActionHarness
} from './si-select-list-action.harness';
import { SiSelectListHarness } from './si-select-list.harness';
import { SiSelectSelectedItemHarness } from './si-select-selected-item.harness';

export class SiSelectHarness extends ComponentHarness {
  static hostSelector = 'si-select';
  readonly getSelectedItems = this.locatorForAll(SiSelectSelectedItemHarness);
  private getSelectElement = this.locatorFor('.select');

  /**
   * Clicks one or multiple items by their index. In the case of multi-select, this will toggle the selection state.
   */
  async clickItems(itemIndex: number | number[]): Promise<void> {
    await this.open('click');
    const list = await this.getList();
    for (const index of [itemIndex].flat()) {
      await list!.getItem(index).then(item => item.click());
    }
  }

  /**
   * Clicks one or multiple items by their text. In the case of multi-select, this will toggle the selection state.
   */
  async clickItemsByText(texts: string | string[]): Promise<void> {
    await this.open('click');
    const list = await this.getList();

    for (const text of [texts].flat()) {
      await list!.getItemByText(text).then(item => item.click());
    }
  }

  /**
   * Clicks one action by its text.
   */
  async clickActionByText(option: SiSelectListActionFilter): Promise<void> {
    await this.open('click');
    return this.documentRootLocatorFactory()
      .locatorFor(SiSelectListActionHarness.with(option))()
      .then(action => action.click());
  }

  async hasFilter(): Promise<boolean> {
    return this.host().then(host => host.hasClass('si-select-has-filter'));
  }

  async getPlaceholder(): Promise<string | undefined> {
    return this.locatorForOptional('.text-secondary')().then(placeholder => placeholder?.text());
  }

  async open(trigger?: 'click' | 'enter' | 'space'): Promise<void> {
    switch (trigger) {
      case 'enter':
        return this.getSelectElement().then(element => element.sendKeys(TestKey.ENTER));
      case 'space':
        return this.getSelectElement().then(element => element.sendKeys(' '));
      default:
        return this.getSelectElement().then(element => element.click());
    }
  }

  /**
   * Returns a ComponentHarness for the list of selectable items or null if the list is not opened.
   */
  async getList(): Promise<SiSelectListHarness | SiSelectFilterListHarness | null> {
    const selectId = await this.getSelectElement().then(host => host.getAttribute('aria-controls'));
    if (await this.hasFilter()) {
      return this.documentRootLocatorFactory().locatorForOptional(
        SiSelectFilterListHarness.with(selectId!)
      )();
    } else {
      return this.documentRootLocatorFactory().locatorForOptional(
        SiSelectListHarness.with(selectId!)
      )();
    }
  }

  async getTabindex(): Promise<string | null> {
    return this.getSelectElement().then(element => element.getAttribute('tabindex'));
  }

  async getSelectedTexts(): Promise<string[]> {
    return this.getSelectedItems().then(items => parallel(() => items.map(item => item.getText())));
  }

  async blur(): Promise<void> {
    return this.getSelectElement().then(host => host.blur());
  }

  async getOverflowCount(): Promise<number> {
    await new Promise<void>(resolve => setTimeout(() => resolve()));
    return this.locatorForOptional('.overflow-item')()
      .then(overflow => overflow?.text())
      .then(overflow => overflow?.replace('+', ''))
      .then(overflow => (overflow ? +overflow : 0));
  }
}
