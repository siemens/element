/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-dashboard', () => {
  const example = 'si-dashboard/si-dashboard-layout';

  test(example, async ({ page, si }) => {
    await si.visitExample(example);
    await page.waitForTimeout(1000);
    await si.runVisualAndA11yTests(undefined, undefined);
  });

  test(example + ' expanded', async ({ page, si }) => {
    await si.visitExample(example);

    await page.locator('si-dashboard-card [si-menu-item]').first().click();
    await expect(page.locator('si-dashboard-card.expanded')).toBeVisible();

    await page.waitForTimeout(1000);
    await si.runVisualAndA11yTests('expanded', undefined);
  });

  test(example + ' mobile', async ({ page, si }) => {
    await page.setViewportSize({ width: 570, height: 600 });
    await si.visitExample(example, false);
    await page.waitForTimeout(1000);
    await si.runVisualAndA11yTests('mobile', undefined);
  });

  test(example + ' mobile expanded', async ({ page, si }) => {
    await page.setViewportSize({ width: 570, height: 600 });
    await si.visitExample(example, false);
    await page.locator('si-dashboard-card [si-menu-item]').first().click();
    await expect(page.locator('si-dashboard-card.expanded')).toBeVisible();
    await page.waitForTimeout(1000);
    await si.runVisualAndA11yTests('mobile-expanded', undefined);
  });
});
