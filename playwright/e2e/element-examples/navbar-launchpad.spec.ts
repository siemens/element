/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('navbar launchpad', () => {
  const example = 'si-navbar/si-navbar-launchpad';
  const exampleWithCategories = 'si-navbar/si-navbar-launchpad-categories';

  test(example, async ({ page, si }) => {
    await si.visitExample(example);

    await page.getByText('Item 1').click();
    await expect(page.getByText('Application Name')).toBeVisible();
    const trigger = page.getByLabel('Launchpad');
    await trigger.click();
    await expect(page.locator('si-launchpad-factory .app-switcher')).toBeVisible();

    await si.runVisualAndA11yTests();
  });

  test(example + ' medium size', async ({ page, si }) => {
    await page.setViewportSize({ width: 760, height: 600 });
    await si.visitExample(example, false);

    await page.getByText('Item 1').click();
    await expect(page.getByText('Application Name')).toBeVisible();
    const trigger = page.getByLabel('Launchpad');
    await trigger.click();
    await expect(page.locator('si-launchpad-factory .app-switcher')).toBeVisible();

    await si.runVisualAndA11yTests('medium-size');
  });

  test(example + ' mobile size', async ({ page, si }) => {
    await page.setViewportSize({ width: 570, height: 600 });
    await si.visitExample(example, false);

    await expect(page.getByText('Application Name')).toBeVisible();
    const toggler = page.getByLabel('Toggle navigation');
    await toggler.click();
    await expect(page.getByText('Item 1')).toBeVisible();

    await si.runVisualAndA11yTests('mobile-size');
  });

  test(example + ' profile-menu', async ({ page, si }) => {
    await si.visitExample(example, false);

    await page.getByRole('button', { name: 'Jane Smith' }).click();
    await expect(page.getByText('jane.smith@example.org')).toBeVisible();

    await si.runVisualAndA11yTests('profile-menu');
  });

  test(exampleWithCategories, async ({ page, si }) => {
    await si.visitExample(exampleWithCategories);
    await page.getByLabel('Launchpad').click();
    await expect(page.locator('si-launchpad-factory .app-switcher')).toBeVisible();
    const showMore = page.getByText('Show more');
    await showMore.click();
    await si.runVisualAndA11yTests(undefined, {
      axeRulesSet: [{ id: 'scrollable-region-focusable', enabled: false }]
    });
  });
});
