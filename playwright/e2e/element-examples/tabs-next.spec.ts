/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-tabs-next', () => {
  const example = 'si-tabs/si-tabs-next';
  const routingExample = 'si-tabs/si-tabs-next-routing';
  const iconsExample = 'si-tabs/si-tabs-next-icons';

  test(example, async ({ page, si }) => {
    await si.visitExample(example);
    await expect(page.getByRole('tab', { name: 'Reception' })).toBeVisible();
    await si.runVisualAndA11yTests('base-tabs');
  });

  test(example + ' mobile', async ({ page, si }) => {
    page.setViewportSize({ width: 375, height: 812 });
    await si.visitExample(example);
    await expect(page.locator('[aria-haspopup="menu"]')).toBeVisible();
    await si.runVisualAndA11yTests('tabs-mobile');
  });

  test(example + ' menu', async ({ page, si }) => {
    page.setViewportSize({ width: 375, height: 812 });
    await si.visitExample(example);
    await expect(page.locator('[aria-haspopup="menu"]')).toBeVisible();
    page.locator('[aria-haspopup="menu"]').click();
    await si.runVisualAndA11yTests('tabs-menu');

    page.getByRole('menuitem', { name: 'Deselectable' }).click();
    await si.runVisualAndA11yTests('tabs-menu-last-selected');

    const receptionTabVisible = await page
      .getByRole('tab', { name: 'Reception' })
      .evaluate(element => {
        const rect = element.getBoundingClientRect();
        const parentRect = element.parentElement?.getBoundingClientRect();

        if (!parentRect) {
          return false;
        }
        return rect.left >= parentRect.left && rect.right <= parentRect.right;
      });

    expect(receptionTabVisible).toBeFalsy();
  });

  test(example + ' routing tab', async ({ page, si }) => {
    await si.visitExample(routingExample);
    await expect(page.getByRole('tab', { name: 'Home' })).toBeVisible();
    await page.getByRole('tab', { name: 'Home' }).click();
    await expect(page.getByText('This is the home page')).toBeVisible();
    await si.runVisualAndA11yTests('tabs-menu-routing');

    await page.getByRole('tab', { name: 'Test coverage' }).click();
    await expect(page.getByText('Check E2E coverage details')).toBeVisible();
    await si.runVisualAndA11yTests('tabs-menu-routing-coverage');
  });

  test(example + ' icons', async ({ page, si }) => {
    await si.visitExample(iconsExample);
    await si.runVisualAndA11yTests('tabs-icons');

    page.setViewportSize({ width: 375, height: 812 });
    await si.runVisualAndA11yTests('tabs-icons-mobile');
    await expect(page.locator('[aria-haspopup="menu"]')).toBeVisible();
  });
});
