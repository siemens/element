/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { test } from '../../support/test-helpers';

test.describe('si-datepicker', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure the current date and time for running the tests is always the same
    await page.clock.setFixedTime(Date.UTC(2022, 1, 28, 10, 34, 24, 345));
  });

  const example = 'si-datepicker/si-date-range';

  test(example + ' default', async ({ page, si }) => {
    await si.visitExample(example);
    await si.runVisualAndA11yTests();
  });

  test(example + ' selection', async ({ page, si }) => {
    await si.visitExample(example);
    await page.getByLabel('Open calendar').first().click();
    await page.locator('tbody > tr .si-title-1').first().click();
    await page.locator('tbody > tr .si-title-1').nth(5).click();
    await si.runVisualAndA11yTests('selection');
  });
});

test.describe('si-datepicker', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure the current date and time for running the tests is always the same
    await page.clock.setFixedTime(Date.UTC(2022, 1, 28, 10, 34, 24, 345));
  });

  const example = 'si-datepicker/si-date-range-playground';

  test(example + ' selection', async ({ page, si }) => {
    await si.visitExample(example);
    await page.getByLabel('Open calendar').first().click();
    await page.locator('tbody > tr .si-title-1').first().click();
    await page.locator('tbody > tr .si-title-1').nth(5).click();
    await si.runVisualAndA11yTests('selection');
  });

  test(example + ' ignore-time', async ({ page, si }) => {
    await si.visitExample(example);
    await page.getByLabel('Open calendar').first().click();
    await si.runVisualAndA11yTests('ignore-time-1');
    await page.getByText('Consider time').first().click();
    await si.runVisualAndA11yTests('ignore-time-2');
  });

  test(example + ' click-through-months', async ({ page, si }) => {
    await si.visitExample(example);
    await page.getByLabel('Open calendar').first().click();

    const button = await page
      .locator('.first-datepicker')
      .first()
      .getByLabel('Next')
      .elementHandle();

    for (let index = 0; index < 10; index++) {
      await button!.click();
    }
    await si.runVisualAndA11yTests('click-through-months-1');
    await page.locator('.second-datepicker').first().getByLabel('Previous').click();
    await si.runVisualAndA11yTests('click-through-months-2');
  });

  test(example + ' preview-range', async ({ page, si }) => {
    await si.visitExample(example);
    await page.getByLabel('Open calendar').first().click();
    await page.getByLabel('Sun Mar 26 2023').click();
    await page.getByLabel('Sat Apr 08 2023').hover();
    await si.runVisualAndA11yTests('preview-range-hover');
    await page.getByLabel('Sat Apr 08 2023').click();
  });
});
