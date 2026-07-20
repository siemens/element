/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('navbar vertical next', () => {
  const example = 'si-navbar-vertical-next/si-navbar-vertical-next';

  test(example, async ({ page, si }) => {
    await si.visitExample(example);
    await page.getByRole('link', { name: 'Home' }).click();
    await expect(page.getByRole('link', { name: 'Home' })).toHaveClass(/active/);
    await page.getByRole('button', { name: 'Documentation' }).click();
    await page.getByRole('link', { name: 'Sub item 4' }).click();
    await expect(page.getByRole('link', { name: 'Sub item 4' })).toHaveClass(/active/);
    await page.getByRole('main').click(); // to move focus

    await si.waitForAllAnimationsToComplete();
    await si.runVisualAndA11yTests();
  });

  test(example + ' collapsed', async ({ page, si }) => {
    await si.visitExample(example);

    await page.getByLabel('Toggle', { exact: true }).click();
    await page.getByRole('button', { name: 'User management' }).click();
    await expect(page.getByRole('group', { name: 'User management' })).toBeVisible();
    await page.getByRole('link', { name: 'Sub item 2' }).click();

    await si.waitForAllAnimationsToComplete();
    await si.runVisualAndA11yTests('collapsed');
    await page.getByRole('button', { name: 'User management' }).click();
    await si.runVisualAndA11yTests('collapsed-flyout');
  });

  test(example + ' always flyout toggle', async ({ page, si }) => {
    await si.visitExample(example);

    await page.getByRole('button', { name: 'User management' }).click();
    await expect(page.getByRole('group', { name: 'User management' })).toBeVisible();

    await page.getByRole('checkbox', { name: 'Always flyout' }).check();
    await expect(page.getByRole('button', { name: 'User management' })).not.toHaveClass(/show/);
    await expect(page.getByRole('button', { name: 'User management' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );

    await page.getByRole('button', { name: 'User management' }).click();
    await expect(page.getByRole('group', { name: 'User management' })).toBeVisible();

    await si.waitForAllAnimationsToComplete();
    await si.runVisualAndA11yTests('always-flyout');
  });

  test(example + ' inline collapse toggle', async ({ page, si }) => {
    await si.visitExample(example);

    await page.getByRole('checkbox', { name: 'Inline collapse' }).check();

    await page.getByLabel('Toggle', { exact: true }).click();
    await expect(page.getByLabel('Toggle', { exact: true })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    await expect(page.getByRole('button', { name: 'User management' })).toBeHidden();

    await si.waitForAllAnimationsToComplete();
    await si.runVisualAndA11yTests('inline-collapse');
  });

  test(example + ' inline collapse chip opens sub-menu', async ({ page, si }) => {
    await si.visitExample(example);

    await page.getByRole('checkbox', { name: 'Inline collapse' }).check();
    await page.getByRole('button', { name: 'User management' }).click();
    await page.getByRole('link', { name: 'Sub item', exact: true }).click();
    await page.getByLabel('Toggle', { exact: true }).click();
    await si.waitForAllAnimationsToComplete();

    const chip = page.locator('button[aria-haspopup="true"]');
    await expect(chip).toBeVisible();
    await chip.click();
    await expect(chip).toHaveAttribute('aria-expanded', 'true');

    await page.getByRole('button', { name: 'User management' }).last().click();
    await expect(page.getByRole('link', { name: 'Sub item 2', exact: true })).toBeVisible();

    await si.waitForAllAnimationsToComplete();
    await si.runVisualAndA11yTests('inline-collapse-chip-submenu');
  });

  test(example + ' inline collapse chip closes on leaf click', async ({ page, si }) => {
    await si.visitExample(example);

    await page.getByRole('checkbox', { name: 'Inline collapse' }).check();
    await page.getByRole('button', { name: 'User management' }).click();
    await page.getByRole('link', { name: 'Sub item', exact: true }).click();
    await page.getByLabel('Toggle', { exact: true }).click();
    await si.waitForAllAnimationsToComplete();

    const chip = page.locator('button[aria-haspopup="true"]');
    await chip.click();
    await expect(chip).toHaveAttribute('aria-expanded', 'true');

    await page.getByRole('button', { name: 'User management' }).last().click();
    await page.getByRole('link', { name: 'Sub item 2', exact: true }).click();
    await expect(chip).toHaveAttribute('aria-expanded', 'false');
  });

  test(example + ' inline collapse chip closes on Escape', async ({ page, si }) => {
    await si.visitExample(example);

    await page.getByRole('checkbox', { name: 'Inline collapse' }).check();
    await page.getByRole('button', { name: 'User management' }).click();
    await page.getByRole('link', { name: 'Sub item', exact: true }).click();
    await page.getByLabel('Toggle', { exact: true }).click();

    const chip = page.locator('button[aria-haspopup="true"]');
    await chip.click();
    await expect(chip).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');
    await expect(chip).toHaveAttribute('aria-expanded', 'false');
  });

  test.skip('it should show tooltip only on keyboard interaction', async ({ page, si }) => {
    await si.visitExample(example);
    await page.getByLabel('Toggle', { exact: true }).click();
    await expect(page.getByLabel('Toggle', { exact: true })).toBeVisible();
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

    // This check the tooltip is not visible when using the mouse
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

    await expect(page.getByLabel('Toggle', { exact: true })).toBeVisible();

    await si.waitForAllAnimationsToComplete();
    await si.runVisualAndA11yTests('mobile-collapsed');
  });

  test(example + ' mobile expanded', async ({ page, si }) => {
    await page.setViewportSize({ width: 570, height: 600 });
    await si.visitExample(example, false);

    await page.getByLabel('Toggle', { exact: true }).click();
    await expect(page.getByLabel('Toggle', { exact: true })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    await page.getByText('Documentation').click();
    await page.getByRole('link', { name: 'Sub item 4' }).click();
    await expect(page.getByLabel('Toggle', { exact: true })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    await page.getByLabel('Toggle', { exact: true }).click();

    await si.waitForAllAnimationsToComplete();
    await si.runVisualAndA11yTests('mobile-expanded');
  });
});

test.describe('navbar vertical next badges', () => {
  const example = 'si-navbar-vertical-next/si-navbar-vertical-next-badges';

  test(example + ' expanded', async ({ page, si }) => {
    await si.visitExample(example);
    await page.getByRole('link', { name: 'Home' }).click();
    await expect(page.getByRole('link', { name: 'Home' })).toHaveClass(/active/);
    await page.getByRole('button', { name: 'Group with badges' }).click();
    await page.getByRole('link', { name: 'Sub item critical' }).click();
    await expect(page.getByRole('link', { name: 'Sub item critical' })).toHaveClass(/active/);
    await page.getByRole('main').click(); // to move focus

    await si.waitForAllAnimationsToComplete();
    await si.runVisualAndA11yTests();
  });

  test(example + ' collapsed', async ({ page, si }) => {
    await si.visitExample(example);

    await page.getByLabel('Toggle', { exact: true }).click();
    await page.getByRole('button', { name: 'Group with badges' }).click();
    await expect(page.getByRole('group', { name: 'Group with badges' })).toBeVisible();
    await page.getByRole('link', { name: 'Sub item info' }).click();

    await si.waitForAllAnimationsToComplete();
    await si.runVisualAndA11yTests('collapsed');
    await page.getByRole('button', { name: 'Group with badges' }).click();
    await si.runVisualAndA11yTests('collapsed-flyout');
  });
});
