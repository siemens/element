/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('ag-grid-filter', () => {
  const example = 'ag-grid/ag-grid-filter';

  test(example, async ({ page, si }) => {
    await si.visitExample(example);

    // Wait for ag-grid to be fully rendered
    await expect(page.locator('.ag-root-wrapper')).toBeVisible();
    await expect(page.locator('.ag-row').first()).toBeVisible();

    // Verify columns are present
    await expect(page.locator('.ag-header-cell-text').filter({ hasText: 'name' })).toBeVisible();
    await expect(page.locator('.ag-header-cell-text').filter({ hasText: 'age' })).toBeVisible();

    await expect(page.locator('.ag-floating-filter-button[aria-hidden="false"]')).toHaveCount(3);

    await si.runVisualAndA11yTests('ag-grid-filter', {
      axeRulesSet: [
        { id: 'label-title-only', enabled: false },
        { id: 'label', enabled: false }
      ]
    });

    // Apply filter on 'name' column
    const nameFilterInput = page.locator('.ag-floating-filter-input input').first();
    await nameFilterInput.fill('Max Meier 1');
    await page.keyboard.press('Enter');

    // Verify filtered results
    await expect(page.locator('.ag-row')).toHaveCount(11);

    await si.runVisualAndA11yTests('ag-grid-filter-on-name', {
      axeRulesSet: [
        { id: 'label-title-only', enabled: false },
        { id: 'label', enabled: false }
      ]
    });

    // Clear filter
    await nameFilterInput.fill('');
    await page.keyboard.press('Enter');

    // Apply filter on 'age' column
    const ageFilterInput = page.locator('.ag-floating-filter-input input').nth(1);
    await ageFilterInput.fill('25');
    await page.keyboard.press('Enter');

    // Verify filtered results
    await expect(page.locator('.ag-row')).toHaveCount(3);

    await si.runVisualAndA11yTests('ag-grid-filter-on-age', {
      axeRulesSet: [
        { id: 'label-title-only', enabled: false },
        { id: 'label', enabled: false }
      ]
    });
  });
});
