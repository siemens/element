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
    await page.locator('.si-layout-main-padding').click(); // to move focus

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
    await expect(page.locator('.nav-content')).toHaveAttribute('inert', '');

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

    const chip = page.getByRole('button', { name: 'User management' });
    await expect(chip).toBeVisible();
    await chip.click();

    await expect(page.getByRole('group', { name: 'User management' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sub item', exact: true })).toBeVisible();

    await si.waitForAllAnimationsToComplete();
    await si.runVisualAndA11yTests('inline-collapse-chip-submenu');
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

  test.describe('mobile', () => {
    test.beforeEach(async ({ page, si }) => {
      await page.setViewportSize({ width: 570, height: 600 });
      await si.visitExample(example, false);
    });

    test(example + ' collapsed', async ({ page, si }) => {
      await expect(page.locator('.mobile-drawer')).toBeVisible();

      await si.waitForAllAnimationsToComplete();
      await si.runVisualAndA11yTests('mobile-collapsed');
    });

    test.describe('flat group', () => {
      test.beforeEach(async ({ page }) => {
        // Expand the drawer and open the Documentation flat group.
        await page.locator('.mobile-drawer > button').click();
        await expect(page.locator('si-navbar-vertical-next:not(.nav-collapsed)')).toBeVisible();
        await page.getByRole('button', { name: 'Documentation' }).click();
        await expect(page.locator('si-navbar-vertical-next.nav-flat-group-open')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();
      });

      test(example + ' opened', async ({ page, si }) => {
        // Sub-items of the opened flat group are visible. The trigger button itself
        // is hidden in flat-group-open state (only the header label + back button show).
        await expect(page.getByRole('link', { name: 'Sub item 4' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Sub item 5' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Sub item 6' })).toBeVisible();

        await si.waitForAllAnimationsToComplete();
        await si.runVisualAndA11yTests('mobile-flat-group-opened');
      });

      test(example + ' expanded', async ({ page, si }) => {
        await expect(page.getByRole('link', { name: 'Sub item 4' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Sub item 5' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Sub item 6' })).toBeVisible();

        // Click Sub item 4: navigates and collapses the drawer on mobile.
        await page.getByRole('link', { name: 'Sub item 4' }).click();
        await expect(page).toHaveURL(/subItem4/);

        // Re-open the drawer: the flat group state is preserved and the
        // active item is highlighted.
        await page.locator('.mobile-drawer > button').click();
        await expect(page.locator('si-navbar-vertical-next.nav-flat-group-open')).toBeVisible();
        await expect(page.getByRole('link', { name: 'Sub item 4' })).toHaveClass(/active/);

        await si.waitForAllAnimationsToComplete();
        await si.runVisualAndA11yTests('mobile-expanded');
      });

      test(example + ' back navigation closes the submenu', async ({ page, si }) => {
        await page.getByRole('button', { name: 'Back' }).click();

        await expect(page.getByRole('button', { name: 'Back' })).toHaveCount(0);
        await expect(page.locator('si-navbar-vertical-next.nav-flat-group-open')).toHaveCount(0);
        await expect(page.getByRole('button', { name: 'Documentation' })).toHaveAttribute(
          'aria-expanded',
          'false'
        );

        await si.waitForAllAnimationsToComplete();
        await si.runVisualAndA11yTests('mobile-flat-group-closed');
      });

      test(
        example + ' is preserved across drawer collapse and auto-closes on resize',
        async ({ page, si }) => {
          // Collapse the drawer: flat group state is preserved.
          await page.locator('.mobile-drawer > button').click();
          await expect(page.locator('si-navbar-vertical-next.nav-collapsed')).toBeVisible();

          // Re-open the drawer: the same flat group is still open.
          await page.locator('.mobile-drawer > button').click();
          await expect(page.locator('si-navbar-vertical-next.nav-flat-group-open')).toBeVisible();
          await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();

          // Resize to desktop: flat group auto-closes and the group falls back to flyout.
          await page.setViewportSize({ width: 1200, height: 800 });
          await expect(page.locator('si-navbar-vertical-next.nav-flat-group-open')).toHaveCount(0);
          await expect(page.getByRole('button', { name: 'Back' })).toHaveCount(0);
          await page.getByRole('button', { name: 'Documentation' }).click();
          await expect(page.getByRole('group', { name: 'Documentation' })).toBeVisible();

          await si.waitForAllAnimationsToComplete();
          await si.runVisualAndA11yTests('mobile-flat-group-resize-out');
        }
      );
    });
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
    await page.locator('.si-layout-main-padding').click(); // to move focus

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
