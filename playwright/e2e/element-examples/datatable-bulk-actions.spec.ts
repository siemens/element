/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test('datatable/datatable-bulk-actions keeps bulk actions below the header when scrolling', async ({
  page,
  si
}) => {
  await si.visitExample('datatable/datatable-bulk-actions');
  const table = page.locator('ngx-datatable');
  await table.getByRole('checkbox', { name: 'Select all', exact: true }).check();
  const summary = table.locator('.datatable-summary-row');
  await expect(summary).toBeVisible();

  await table.locator('.datatable-grid').evaluate(element => {
    element.scrollTop = element.scrollHeight;
  });

  await expect
    .poll(async () => {
      const headerBounds = await table.locator('datatable-header').boundingBox();
      const summaryBounds = await summary.boundingBox();
      if (!headerBounds || !summaryBounds) {
        return Infinity;
      }
      return Math.abs(summaryBounds.y - headerBounds.y - headerBounds.height);
    })
    .toBeLessThanOrEqual(1);
  await expect(summary.getByRole('button').first()).toBeInViewport();

  await table.getByRole('checkbox', { name: 'Select all', exact: true }).uncheck();
  await expect(summary).toHaveCount(0);
});
