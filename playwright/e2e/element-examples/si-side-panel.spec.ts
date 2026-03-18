/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-side-panel', () => {
  const example = 'si-side-panel/si-side-panel';
  const exampleCollapsible = 'si-side-panel/si-side-panel-collapsible';

  const exampleCollapsibleLegacyStatusActions =
    'si-side-panel/si-side-panel-collapsible-legacy-status-actions';

  test(`${example} - modes and backdrop`, async ({ page, si }) => {
    await si.visitExample(example);

    await page.locator('.btn').getByText('Toggle side panel').click();
    await expect(page.locator('si-side-panel > div').first()).toBeVisible();

    await si.runVisualAndA11yTests();
  });

  test(exampleCollapsible, async ({ page, si }) => {
    await si.visitExample(exampleCollapsible);

    await page.locator('.btn').getByText('close').click();
    await expect(page.locator('si-side-panel.rpanel-collapsed')).toBeVisible();
    await si.runVisualAndA11yTests('closed');

    await page.locator('.btn').getByText('Toggle side panel').click();
    await expect(page.locator('si-side-panel:not(.rpanel-collapsed)')).toBeVisible();
    await si.runVisualAndA11yTests('open');
  });

  test(exampleCollapsibleLegacyStatusActions, async ({ page, si }) => {
    await si.visitExample(exampleCollapsibleLegacyStatusActions);

    await page.locator('.btn').getByText('close').click();
    await expect(page.locator('si-side-panel.rpanel-collapsed')).toBeVisible();
    await si.runVisualAndA11yTests('legacy-closed');

    await page.locator('.btn').getByText('Toggle side panel').click();
    await expect(page.locator('si-side-panel:not(.rpanel-collapsed)')).toBeVisible();
    await si.runVisualAndA11yTests('legacy-open');
  });
});
