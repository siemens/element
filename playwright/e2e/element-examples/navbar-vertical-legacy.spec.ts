/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('navbar vertical', () => {
  const example = 'si-navbar-vertical/si-navbar-vertical-legacy';

  test(example, async ({ page, si }) => {
    await si.visitExample(example);

    const subItem2 = page.getByText('Sub Item 2');
    await page.getByLabel('expand Home').click();
    await subItem2.click();
    await page.getByLabel('collapse Home').click();
    await expect(subItem2).not.toBeVisible();
    await page.getByRole('link', { name: 'Home' }).click();
    await page.getByText('Documentation').click();
    await page.getByRole('link', { name: 'Sub Item 4' }).click();
    await expect(page.getByRole('link', { name: 'Sub Item 4' })).toHaveClass(/active/);
    await page.locator('.si-layout-main-padding').click(); // to move focus

    await si.waitForAllAnimationsToComplete();
    await si.runVisualAndA11yTests();
  });

  test(example + ' collapsed', async ({ page, si }) => {
    await si.visitExample(example);

    await page.getByLabel('collapse', { exact: true }).click();
    await page.getByRole('button', { name: 'Documentation' }).click();
    await page.getByRole('link', { name: 'Sub Item 4' }).click();
    await expect(page.getByRole('link', { name: 'Sub Item 4' })).not.toBeVisible();

    await si.waitForAllAnimationsToComplete();
    await si.runVisualAndA11yTests('collapsed');
    await page.getByRole('button', { name: 'Documentation' }).click();
    await si.runVisualAndA11yTests('collapsed-flyout');
  });

  test(example + ' mobile collapsed', async ({ page, si }) => {
    await page.setViewportSize({ width: 570, height: 600 });
    await si.visitExample(example, false);

    await expect(page.locator('.mobile-drawer')).toBeVisible();

    await si.waitForAllAnimationsToComplete();
    await si.runVisualAndA11yTests('mobile-collapsed');
  });

  test(example + ' mobile expanded', async ({ page, si }) => {
    await page.setViewportSize({ width: 570, height: 600 });
    await si.visitExample(example, false);

    await page.locator('.mobile-drawer > button').click();
    await expect(page.locator('si-navbar-vertical:not(.nav-collapsed)')).toBeVisible();
    await page.getByText('Documentation').click();
    await page.getByRole('link', { name: 'Sub Item 4' }).click();
    await expect(page.locator('si-navbar-vertical:not(.nav-collapsed)')).toHaveCount(0);
    await page.locator('.mobile-drawer > button').click();

    await si.waitForAllAnimationsToComplete();
    await si.runVisualAndA11yTests('mobile-expanded');
  });
});
