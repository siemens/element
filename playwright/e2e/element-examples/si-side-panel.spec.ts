/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-side-panel', () => {
  const example = 'si-side-panel/si-side-panel';
  const exampleCollapsible = 'si-side-panel/si-side-panel-collapsible';

  test(`${example} - modes and backdrop`, async ({ page, si }) => {
    await si.visitExample(example);

    // Test over mode (default)
    await page.locator('[icon="element-menu"]').click();
    await expect(page.locator('si-side-panel:not(.rpanel-collapsed)')).toBeVisible();
    await si.runVisualAndA11yTests('over-mode');

    // Close panel to avoid backdrop interference
    await page.locator('.modal-backdrop').click();
    await expect(page.locator('si-side-panel.rpanel-collapsed')).toBeVisible();

    // Test scroll mode
    await page.locator('label[for="mode-scroll"]').click();
    await page.locator('[icon="element-menu"]').click();
    await expect(page.locator('si-side-panel.rpanel-mode--scroll')).toBeVisible();
    await si.runVisualAndA11yTests('scroll-mode');

    // Close panel and switch back to over mode for backdrop tests
    await page.locator('[icon="element-menu"]').click();
    await page.locator('label[for="mode-over"]').click();
    await page.locator('[icon="element-menu"]').click();

    // Test backdrop presence in over mode
    await expect(page.locator('.modal-backdrop')).toBeVisible();

    // Test backdrop click closes panel
    await page.locator('.modal-backdrop').click();
    await expect(page.locator('si-side-panel.rpanel-collapsed')).toBeVisible();

    // Test disabling backdrop
    await page.locator('#backdrop-switch').click();
    await page.locator('[icon="element-menu"]').click();
    await expect(page.locator('.modal-backdrop')).not.toBeVisible();
    await si.runVisualAndA11yTests('over-mode-no-backdrop');

    // Close panel, re-enable backdrop, then reopen
    await page.locator('[icon="element-menu"]').click();
    await page.locator('#backdrop-switch').click();
    await page.locator('[icon="element-menu"]').click();
    await expect(page.locator('.modal-backdrop')).toBeVisible();
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
});
