/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test('si-search-field/si-search-field', async ({ page, si }) => {
  await si.visitExample('si-search-field/si-search-field');
  await si.runVisualAndA11yTests('empty');

  await page.getByRole('combobox', { name: 'Search states' }).fill('Ala');
  await expect(page.getByRole('option', { name: 'Alabama' })).toBeVisible();
  await expect(page.getByText('Debounced search term: Ala', { exact: true })).toBeVisible();
  await si.runVisualAndA11yTests('filled');
});
