/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-breadcrumb', () => {
  const example = 'si-breadcrumb/si-breadcrumb';

  test(example + ' dropdown', async ({ page, si }) => {
    await page.setViewportSize({ width: 760, height: 600 });
    await si.visitExample(example, false);
    const breadcrumb = page.getByRole('navigation', { name: 'root as icon breadcrumbs' });
    const toggle = breadcrumb.getByRole('button', { name: '...', exact: true });
    await toggle.click();
    await toggle.blur();
    await expect(toggle.locator('..').locator('.dropdown-menu')).toBeVisible();

    await si.runVisualAndA11yTests('dropdown');
  });

  test(example + ' shortened', async ({ page, si }) => {
    await page.setViewportSize({ width: 760, height: 600 });
    await si.visitExample(example, false);
    const breadcrumb = page.getByRole('navigation', { name: 'root as icon breadcrumbs' });
    const toggle = breadcrumb.getByRole('button').nth(0);
    await toggle.click();
    await toggle.blur();
    await expect(toggle.locator('..').locator('.dropdown-menu')).toBeVisible();

    await si.runVisualAndA11yTests('shortened');
  });
});
