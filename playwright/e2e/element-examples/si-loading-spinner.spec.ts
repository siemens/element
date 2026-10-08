/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-loading-spinner', () => {
  test('directive toggles translated loading text', async ({ page, si }) => {
    await si.visitExample('si-loading-spinner/si-loading-spinner-directive');

    const spinner = page.locator('si-loading-spinner .loading');
    const loadingText = spinner.getByText('Retrieving data…', { exact: true });
    const withLoadingText = page.getByRole('checkbox', { name: 'With loading text' });

    await expect(withLoadingText).not.toBeChecked();
    await page.getByRole('button', { name: 'Toggle Loading' }).click();
    await expect(spinner).toBeVisible();
    await expect(loadingText).toHaveCount(0);

    await withLoadingText.check();
    await expect(loadingText).toBeVisible();

    await withLoadingText.uncheck();
    await expect(loadingText).toHaveCount(0);
    await expect(spinner).toBeVisible();
  });

  test('component toggles translated loading text', async ({ page, si }) => {
    await si.visitExample('si-loading-spinner/si-loading-spinner');

    const spinner = page.locator('si-loading-spinner .loading');
    const loadingText = spinner.getByText('Retrieving data…', { exact: true });
    const withLoadingText = page.getByRole('checkbox', { name: 'With loading text' });

    await expect(spinner).toBeVisible();
    await expect(loadingText).toHaveCount(0);

    await withLoadingText.check();
    await expect(loadingText).toBeVisible();
    await si.runVisualAndA11yTests('with-loading-text');

    await withLoadingText.uncheck();
    await expect(loadingText).toHaveCount(0);
    await expect(spinner).toBeVisible();
  });
});
