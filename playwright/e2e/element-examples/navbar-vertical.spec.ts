/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('navbar vertical', () => {
  const example = 'si-navbar-vertical/si-navbar-vertical';

  test(example, async ({ page, si }) => {
    await si.visitExample(example);
    await page.getByRole('link', { name: 'Home' }).click();
    await expect(page.getByRole('link', { name: 'Home' })).toHaveClass(/active/);
    await page.getByRole('button', { name: 'Documentation' }).click();
    await page.getByRole('link', { name: 'Sub Item 4' }).click();
    await expect(page.getByRole('link', { name: 'Sub Item 4' })).toHaveClass(/active/);
    await page.locator('.si-layout-main-padding').click(); // to move focus

    await si.waitForAllAnimationsToComplete();
    await si.runVisualAndA11yTests();
  });

  test(example + ' collapsed', async ({ page, si }) => {
    await si.visitExample(example);

    await page.getByLabel('collapse', { exact: true }).click();
    await page.getByRole('button', { name: 'User management' }).click();
    await expect(page.getByRole('group', { name: 'User management' })).toBeVisible();
    await page.getByRole('link', { name: 'Sub Item 2' }).click();

    await si.waitForAllAnimationsToComplete();
    await si.runVisualAndA11yTests('collapsed');
    await page.getByRole('button', { name: 'User management' }).click();
    await si.runVisualAndA11yTests('collapsed-flyout');
  });

  test('it should show tooltip only on keyboard interaction', async ({ page, si }) => {
    await si.visitExample(example);
    await page.getByLabel('collapse', { exact: true }).click();
    await expect(page.getByLabel('expand', { exact: true })).toBeVisible();
    await si.waitForAllAnimationsToComplete();
    const userManagement = page.getByRole('button', { name: 'User management' });
    const tooltip = page.getByRole('tooltip', { name: 'User management' });
    const group = page.getByRole('group', { name: 'User management' });

    // This checks the tooltip is visible when using the keyboard
    await userManagement.focus();
    await userManagement.press('Enter');
    await expect(group.getByRole('link', { name: 'Sub item', exact: true })).toBeFocused();
    await group.press('Escape');
    await expect(tooltip).toBeVisible();
    await expect(userManagement).toBeFocused();

    // This check the tooltip is not visible whe using the mouse
    await userManagement.click();
    await group.hover();
    await expect(tooltip).not.toBeVisible();
    await page.getByRole('main').click(); // outside click to hide flyout
    await expect(userManagement).toBeFocused();
    await expect(tooltip).not.toBeVisible();
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

test.describe('navbar vertical badges', () => {
  const example = 'si-navbar-vertical/si-navbar-vertical-badges';

  test(example + ' expanded', async ({ page, si }) => {
    await si.visitExample(example);
    await page.getByRole('link', { name: 'Home' }).click();
    await expect(page.getByRole('link', { name: 'Home' })).toHaveClass(/active/);
    await page.getByRole('button', { name: 'Group with badges' }).click();
    await page.getByRole('link', { name: 'Sub item critical' }).click();
    await expect(page.getByRole('link', { name: 'Sub item critical' })).toHaveClass(/active/);
    await page.locator('.si-layout-main-padding').click(); // to move focus

    await si.waitForAllAnimationsToComplete();
    await si.runVisualAndA11yTests();
  });

  test(example + ' collapsed', async ({ page, si }) => {
    await si.visitExample(example);

    await page.getByLabel('collapse', { exact: true }).click();
    await page.getByRole('button', { name: 'Group with badges' }).click();
    await expect(page.getByRole('group', { name: 'Group with badges' })).toBeVisible();
    await page.getByRole('link', { name: 'Sub item info' }).click();

    await si.waitForAllAnimationsToComplete();
    await si.runVisualAndA11yTests('collapsed');
    await page.getByRole('button', { name: 'Group with badges' }).click();
    await si.runVisualAndA11yTests('collapsed-flyout');
  });
});
