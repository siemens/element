/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-typeahead', () => {
  const example = 'si-typeahead/si-typeahead-basic';

  test(example, async ({ page, si }) => {
    await si.visitExample(example);
    await page.locator('input[type="text"]').fill('al');
    await expect(page.getByText('Alabama')).toHaveCount(1);
    await page.waitForTimeout(1000); // Wait for model (output) to update
    await si.runVisualAndA11yTests();
  });

  test(`${example} disabled`, async ({ page, si }) => {
    await si.visitExample(example);
    await page.getByRole('checkbox', { name: 'Show Icon' }).check();
    await page.getByRole('checkbox', { name: 'Disable', exact: true }).check();

    const searchBar = page.getByRole('combobox', { name: 'States' });
    await searchBar.hover();
    await si.runVisualAndA11yTests('disabled-base-1-hover');

    await page.getByRole('combobox', { name: 'Color Variant' }).selectOption('base-0');
    await searchBar.hover();
    await si.runVisualAndA11yTests('disabled-base-0-hover');
  });

  const customExample = 'si-typeahead/si-typeahead-custom';

  test(customExample, async ({ page, si }) => {
    await si.visitExample(customExample);
    await page.getByRole('textbox').fill('al');
    await expect(page.getByText('Alabama')).toHaveCount(1);
    await page.waitForTimeout(1000); // Wait for model (output) to update
    await si.runVisualAndA11yTests();
  });
});
