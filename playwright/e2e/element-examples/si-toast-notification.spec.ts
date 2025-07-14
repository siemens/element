/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-toast-notification', () => {
  const example = 'si-toast-notification/si-toast-notification';

  test.afterEach(async ({ page }) => {
    await page.locator('.btn').getByText('Hide all').click();
  });

  test(example + ' part 1', async ({ page, si }) => {
    await si.visitExample(example);

    await page.locator('.btn').getByText('Success toast').click();
    await page.locator('.btn').getByText('Danger toast').click();
    await page.locator('.btn').getByText('Info toast').click();
    await expect(page.locator('.toast-content').first()).toBeVisible();
    await page.waitForTimeout(1000); // wait for animation

    await si.runVisualAndA11yTests('part-1');
  });

  test(example + ' part 2', async ({ page, si }) => {
    await si.visitExample(example);

    await page.locator('.btn').getByText('Warning toast').click();
    await page.locator('.btn').getByText('Actionable toast').click();
    await page.locator('.btn').getByText('Manual close only').click();
    await page.locator('.btn').getByText('Auto close only').click();
    await expect(page.locator('.toast-content').first()).toBeVisible();
    await page.waitForTimeout(1000); // wait for animation

    await si.runVisualAndA11yTests('part-2');
  });
});
