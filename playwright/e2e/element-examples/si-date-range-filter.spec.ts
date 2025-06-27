/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-date-range-filter', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure the current date and time for running the tests is always the same
    await page.clock.setFixedTime(Date.UTC(2023, 7, 8, 10, 34, 24, 345));
  });

  const example = 'si-date-range-filter/si-date-range-filter';

  test(example, async ({ page, si }) => {
    await si.visitExample(example);
    await si.runVisualAndA11yTests('default');
  });

  test(example + ' to date', async ({ page, si }) => {
    await si.visitExample(example);

    await page.getByText('Input mode').click();
    await expect(page.locator('input[name=point2]')).toHaveCount(1);

    await si.runVisualAndA11yTests('date');
  });

  test(example + ' range', async ({ page, si }) => {
    await si.visitExample(example);

    await page.locator('si-date-range-filter').getByText('Advanced').click();
    await expect(page.getByText('Before')).toHaveCount(1);

    await si.runVisualAndA11yTests('range');
  });
});
