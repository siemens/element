/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { expect, test } from '../../support/test-helpers';

test.describe('ag-grid-tooltip', () => {
  const example = 'ag-grid/ag-grid-tooltip';

  test(example, async ({ page, si }) => {
    await si.visitExample(example);

    // Wait for ag-grid to be fully rendered
    await expect(page.locator('.ag-root-wrapper')).toBeVisible();
    await expect(page.locator('.ag-row').first()).toBeVisible();

    // Verify columns are present
    await expect(page.locator('.ag-header-cell-text').filter({ hasText: 'name' })).toBeVisible();
    await expect(page.locator('.ag-header-cell-text').filter({ hasText: 'role' })).toBeVisible();

    await si.runVisualAndA11yTests('ag-grid-tooltip');

    // Hover over the first row's 'name' cell to trigger tooltip
    const firstNameCell = page.locator('.ag-row').first().locator('.ag-cell[col-id="name"]');
    await firstNameCell.hover();

    // Verify tooltip appears
    const tooltip = page.locator('.ag-tooltip');
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText(/This is a dynamic tooltip using the value of \w+/);

    await si.runVisualAndA11yTests('ag-grid-tooltip-visible');
  });
});
