/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('datatable error handling', () => {
  const example = 'datatable/datatable-error-handling';

  test(example, async ({ page, si }) => {
    await si.visitExample(example);
    const table = page.locator('ngx-datatable');
    const serverResponse = page.getByLabel('Simulated server response');

    await expect(table.getByRole('alert')).toContainText('Failed to load users');
    await si.runVisualAndA11yTests();

    await table.getByRole('button', { name: 'Retry' }).click();
    await expect(table).toBeFocused();
    await expect(table.getByRole('alert')).toContainText('Failed to load users');

    await serverResponse.selectOption('403 Forbidden');
    await expect(table.getByRole('alert')).toContainText('Insufficient access rights');
    await expect(table.getByRole('alert').getByRole('button')).toHaveCount(0);

    await serverResponse.selectOption('200 OK');
    await expect(table.getByRole('row', { name: /Max Meier 0/ })).toBeVisible();
    await expect(page.getByRole('alert')).toHaveCount(0);
  });

  test(example + ' reload failed', async ({ page, si }) => {
    await si.visitExample(example);
    const table = page.locator('ngx-datatable');
    const serverResponse = page.getByLabel('Simulated server response');

    await serverResponse.selectOption('200 OK');
    await expect(table.getByRole('row', { name: /Max Meier 0/ })).toBeVisible();

    await serverResponse.selectOption('Network error');
    await expect(page.getByRole('alert')).toContainText('No connection to server');
    await expect(table.getByRole('row', { name: /Max Meier 0/ })).toBeVisible();
    await si.runVisualAndA11yTests('reload-failed');

    await page.getByRole('button', { name: '2', exact: true }).click();
    await expect(table.getByRole('alert')).toContainText('No connection to server');
    await expect(table.getByRole('row', { name: /Max Meier/ })).toHaveCount(0);

    await serverResponse.selectOption('200 OK');
    await expect(table.getByRole('row', { name: /Max Meier 5/ })).toBeVisible();
  });
});
