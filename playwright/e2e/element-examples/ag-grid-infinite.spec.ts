/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { expect, test } from '../../support/test-helpers';

test.describe('ag-grid-infinite', () => {
  const example = 'ag-grid/ag-grid-infinite';

  test(example, async ({ page, si }) => {
    await si.visitExample(example);

    // Wait for ag-grid to be fully rendered
    await expect(page.locator('.ag-root-wrapper')).toBeVisible();
    await expect(page.locator('.ag-row').first()).toBeVisible();

    // Verify columns are present
    await expect(page.locator('.ag-header-cell-text').filter({ hasText: 'name' })).toBeVisible();
    await expect(page.locator('.ag-header-cell-text').filter({ hasText: 'role' })).toBeVisible();

    await si.runVisualAndA11yTests('ag-grid-infinite', {
      axeRulesSet: [{ id: 'empty-table-header', enabled: false }]
    });

    // Wait for skeleton loaders to disappear (data has loaded)
    await expect(page.locator('.ag-skeleton-effect')).toHaveCount(0, { timeout: 10000 });

    // Scroll to the bottom to trigger infinite loading
    const gridBody = page.locator('.ag-body-viewport');
    const initialRowCount = await page.locator('.ag-row').count();

    await gridBody.evaluate(el => {
      el.scrollTop = el.scrollHeight;
    });

    // Wait for new rows to load: first verify row count increases, then verify loading completes
    // Step 1: Wait for row count to increase (confirms new rows are being loaded)
    await expect(page.locator('.ag-row')).not.toHaveCount(initialRowCount, { timeout: 10000 });

    // Step 2: Wait for skeleton loaders to disappear (confirms loading completed)
    await expect(page.locator('.ag-skeleton-effect')).toHaveCount(0, { timeout: 10000 });

    await si.runVisualAndA11yTests('ag-grid-infinite-after-scroll', {
      axeRulesSet: [{ id: 'empty-table-header', enabled: false }]
    });
  });
});
