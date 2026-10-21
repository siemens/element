/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-date-range-filter', () => {
  // Temporary suppression tracked in #3014.
  const labelContentNameMismatchRule = {
    id: 'label-content-name-mismatch',
    enabled: false
  };

  test.beforeEach(async ({ page }) => {
    // Ensure the current date and time for running the tests is always the same
    await page.clock.setFixedTime(Date.UTC(2023, 7, 8, 10, 34, 24, 345));
  });

  const example = 'si-date-range-filter/si-date-range-filter';

  test(example, async ({ page, si }) => {
    await si.visitExample(example);
    await si.runVisualAndA11yTests('default', {
      axeRulesSet: [labelContentNameMismatchRule]
    });
  });

  test(example + ' to date', async ({ page, si }) => {
    await si.visitExample(example);

    await page.getByText('Input mode').click();
    await expect(page.locator('input[name=point2]')).toHaveCount(1);

    await si.runVisualAndA11yTests('date', {
      axeRulesSet: [labelContentNameMismatchRule]
    });
  });

  test(example + ' range', async ({ page, si }) => {
    await si.visitExample(example);

    await page.locator('si-date-range-filter').getByText('Advanced').click();
    await expect(page.getByText('Before')).toHaveCount(1);

    await si.runVisualAndA11yTests('range', {
      axeRulesSet: [labelContentNameMismatchRule]
    });
  });

  test(example + ' mobile', async ({ page, si }) => {
    await page.setViewportSize({ width: 400, height: 660 });
    await si.visitExample(example);
    await si.runVisualAndA11yTests('mobile', {
      axeRulesSet: [labelContentNameMismatchRule]
    });

    await page.locator('si-date-range-filter').getByText('Presets').click();
    await page.getByRole('option', { name: 'last 24h' }).hover(); // Ensures the hover state is gone from the presets.
    await si.runVisualAndA11yTests('mobile-presets', {
      axeRulesSet: [labelContentNameMismatchRule]
    });
  });
});
