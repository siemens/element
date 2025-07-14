/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-breadcrumb', () => {
  const example = 'si-breadcrumb/si-breadcrumb';

  test(example + ' dropdown', async ({ page, si }) => {
    await page.setViewportSize({ width: 760, height: 600 });
    await si.visitExample(example, false);
    const toggle = await page.locator('.breadcrumb-dropdown-toggle').nth(1);
    await toggle.click();
    await toggle.blur();
    await expect(page.locator('.breadcrumb-dropdown-wrapper').first()).toBeVisible();

    await si.runVisualAndA11yTests('dropdown');
  });

  test(example + ' shortened', async ({ page, si }) => {
    await page.setViewportSize({ width: 760, height: 600 });
    await si.visitExample(example, false);
    const toggle = await page.locator('.breadcrumb-dropdown-toggle').first();
    await toggle.click();
    await toggle.blur();
    await expect(page.locator('.dropdown-menu').first()).toBeVisible();

    await si.runVisualAndA11yTests('shortened');
  });
});
