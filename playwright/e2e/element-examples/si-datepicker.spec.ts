/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { test } from '../../support/test-helpers';

const examples: string[] = ['si-datepicker/si-datepicker-no-time', 'si-datepicker/si-datepicker'];

test.describe('si-datepicker', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure the current date and time for running the tests is always the same
    await page.clock.setFixedTime(Date.UTC(2022, 1, 28, 10, 34, 24, 345));
  });

  examples.forEach(example => {
    test(example + ' day', async ({ page, si }) => {
      await si.visitExample(example);
      await si.runVisualAndA11yTests();
    });

    test(example + ' month', async ({ page, si }) => {
      await si.visitExample(example);
      await page.locator('.open-month-view').first().click();
      await si.runVisualAndA11yTests('month');
    });

    test(example + ' year', async ({ page, si }) => {
      await si.visitExample(example);
      await page.locator('.open-year-view').first().click();
      await si.runVisualAndA11yTests('year');
    });
  });
});
