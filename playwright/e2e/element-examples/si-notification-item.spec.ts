/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-notification-item', () => {
  const variantsExample = 'si-notification-item/si-notification-item';
  const popoverExample = 'si-notification-item/si-notification-item-popover';
  const sidePanelExample = 'si-notification-item/si-notification-item-side-panel';

  test(popoverExample, async ({ page, si }) => {
    await si.visitExample(popoverExample);

    await page.locator('.header-item').nth(1).click();
    await expect(page.locator('si-notification-item').first()).toBeVisible();

    await si.runVisualAndA11yTests('popover');
  });

  test(sidePanelExample, async ({ page, si }) => {
    await si.visitExample(sidePanelExample);

    await page.locator('.header-item').nth(1).click();
    await expect(page.locator('si-side-panel > div').first()).toBeVisible();

    await si.runVisualAndA11yTests('popover');
  });

  test(variantsExample, async ({ page, si }) => {
    await si.visitExample(variantsExample);

    await si.runVisualAndA11yTests('default');

    await page.locator('input').nth(0).click();

    await si.runVisualAndA11yTests('unread');
  });
});
