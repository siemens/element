/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { test } from '../../support/test-helpers';

const examples: string[] = ['si-datepicker/si-datepicker-no-time', 'si-datepicker/si-datepicker'];

test.describe('si-datepicker', () => {
  // Temporary suppression tracked in #3014.
  const labelContentNameMismatchRule = {
    id: 'label-content-name-mismatch',
    enabled: false
  };

  test.beforeEach(async ({ page }) => {
    // Ensure the current date and time for running the tests is always the same
    await page.clock.setFixedTime(Date.UTC(2022, 1, 28, 10, 34, 24, 345));
  });

  examples.forEach(example => {
    test(example + ' day', async ({ page, si }) => {
      await si.visitExample(example);
      await si.runVisualAndA11yTests(undefined, {
        axeRulesSet: [labelContentNameMismatchRule]
      });
    });

    test(example + ' month', async ({ page, si }) => {
      await si.visitExample(example);
      await page.locator('.open-month-view').first().click();
      await si.runVisualAndA11yTests('month', {
        axeRulesSet: [labelContentNameMismatchRule]
      });
    });

    test(example + ' year', async ({ page, si }) => {
      await si.visitExample(example);
      await page.locator('.open-year-view').first().click();
      await si.runVisualAndA11yTests('year', {
        axeRulesSet: [labelContentNameMismatchRule]
      });
    });
  });

  test('calendar-button states', async ({ page, si }) => {
    await si.visitExample('si-datepicker/si-datepicker-input');
    const calendarButton = page.getByLabel('Open calendar').first();
    await calendarButton.focus();
    await si.runVisualAndA11yTests('calendar-button-focus', {
      skipAriaSnapshot: true,
      axeRulesSet: [labelContentNameMismatchRule]
    });
    await calendarButton.blur();
    await calendarButton.hover();
    await si.runVisualAndA11yTests('calendar-button-hover', {
      skipAriaSnapshot: true,
      axeRulesSet: [labelContentNameMismatchRule]
    });
  });
});
