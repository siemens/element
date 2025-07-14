/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ComponentHarness, TestElement, TestKey } from '@angular/cdk/testing';

export class SiTabsetNextHarness extends ComponentHarness {
  static hostSelector = '.tab-wrapper';
  private tabset = this.locatorForOptional('si-tabset-next');
  private tabItems = this.locatorForAll('si-tab-next');
  private tabButtons = this.locatorForAll('[role="tab"]');
  private activeTabButton = this.locatorFor('[role="tab"][aria-selected="true"]');
  private optionsMenuButton = this.locatorForOptional(
    'button[role="button"][aria-haspopup="menu"]'
  );
  private tabScrollList = this.locatorFor('div.tab-container-buttonbar-list');
  private tabContent = this.locatorFor('div.tab-content:not([hidden])');
  private activeMenuItem = this.documentRootLocatorFactory().locatorFor(
    'a[role="menuitem"].active'
  );
  private menuItems = this.documentRootLocatorFactory().locatorForAll('a[role="menuitem"]');
  private tabScrollWrapper = this.locatorFor('[role="tablist"]');

  async getTabItemsLength(): Promise<number> {
    return (await this.tabItems()).length;
  }

  async getTabItemAt(index: number): Promise<TestElement> {
    const tabItems = await this.tabItems();
    return tabItems[index];
  }

  async getTabItemButtonAt(index: number): Promise<TestElement> {
    const tabButtons = await this.tabButtons();
    return tabButtons[index];
  }

  async getTabItemHeadingAt(index: number): Promise<string> {
    const tabButton = await this.getTabItemButtonAt(index);
    return tabButton.text();
  }

  async getActiveTabItem(): Promise<TestElement> {
    const activeTabButton = await this.activeTabButton();
    return activeTabButton;
  }

  async isTabItemActive(index: number): Promise<boolean> {
    const tabButton = await this.getTabItemButtonAt(index);
    const isActive = await tabButton.getAttribute('aria-selected');
    return isActive === 'true';
  }

  async getCloseButtonForTabAt(index: number): Promise<TestElement> {
    const closeButton = this.locatorForAll(`si-icon-next.close`);
    return (await closeButton())[index];
  }

  async getOptionsMenuButton(): Promise<TestElement | null> {
    return await this.optionsMenuButton();
  }

  async getActiveMenuItem(): Promise<TestElement> {
    return await this.activeMenuItem();
  }

  async getMenuItems(): Promise<TestElement[]> {
    return await this.menuItems();
  }

  async getMenuItemAt(index: number): Promise<TestElement> {
    const menuItems = await this.menuItems();
    return menuItems[index];
  }

  async getTabScrollList(): Promise<TestElement> {
    return await this.tabScrollList();
  }

  async getTabContent(): Promise<TestElement> {
    return await this.tabContent();
  }

  async getActiveElement(): Promise<TestElement | null> {
    return this.documentRootLocatorFactory().locatorForOptional('*:focus')();
  }

  async focusNext(): Promise<void> {
    const activeElement = await this.getActiveElement();
    if (activeElement) {
      await activeElement.sendKeys(TestKey.RIGHT_ARROW);
    }
  }

  async focusPrevious(): Promise<void> {
    const activeElement = await this.getActiveElement();
    if (activeElement) {
      await activeElement.sendKeys(TestKey.LEFT_ARROW);
    }
  }

  async sendTabKey(): Promise<void> {
    const tabset = await this.tabset();
    if (tabset) {
      await tabset.sendKeys(TestKey.TAB);
    }
  }

  async isTabVisible(index: number): Promise<boolean> {
    const tabButton = await this.getTabItemButtonAt(index);
    const rect = await tabButton.getDimensions();
    const containerRect = await (await this.tabScrollWrapper()).getDimensions();
    const rectRight = rect.left + rect.width;
    const containerRectRight = containerRect.left + containerRect.width;

    return (
      Math.round(rect.left) >= Math.round(containerRect.left) &&
      Math.round(rectRight) <= Math.round(containerRectRight)
    );
  }
}
