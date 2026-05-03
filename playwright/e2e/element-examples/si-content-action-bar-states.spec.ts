/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-content-action-bar-states', () => {
  const example = 'si-content-action-bar/si-content-action-bar-states';
  const exampleDashboard = 'si-dashboard/si-dashboard-card';

  test('long list', async ({ page, si }) => {
    await si.visitExample(example);
    await page.getByText('Long-List').first().click();
    await expect(page.locator('.dropdown-menu').first()).toBeVisible();
    await si.runVisualAndA11yTests();
  });

  test('responsive behaviour', async ({ page, si }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await si.visitExample(exampleDashboard);

    await expect(page.getByRole('button', { name: 'Toggle' })).not.toBeVisible();
    // Full menu should be visible at wide viewport
    const menuItems = ['Settings', 'Copy', 'Delete'];
    await expect(page.getByRole('menubar')).toBeVisible();
    for (const item of menuItems) {
      await expect(page.getByRole('menuitem', { name: item })).toBeVisible();
    }

    // Shrink viewport so only the toggle button is visible
    await page.setViewportSize({ width: 350, height: 900 });
    await expect(page.getByRole('button', { name: 'Toggle' })).toBeVisible();
    await expect(page.getByRole('menubar')).not.toBeVisible();

    // Expand viewport so the full menu becomes visible again
    await page.setViewportSize({ width: 1400, height: 900 });
    await expect(page.getByRole('button', { name: 'Toggle' })).not.toBeVisible();
    await expect(page.getByRole('menubar')).toBeVisible();
    for (const item of menuItems) {
      await expect(page.getByRole('menuitem', { name: item })).toBeVisible();
    }
  });
});
