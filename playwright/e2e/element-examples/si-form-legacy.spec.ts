/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { test } from '../../support/test-helpers';

test.describe('si-form', () => {
  const example = 'si-form/si-form-legacy';

  test(example, async ({ page, si }) => {
    await page.clock.setFixedTime('2025-02-25');
    await si.visitExample(example, false);
    await si.runVisualAndA11yTests(undefined);

    await page.setViewportSize({ width: 1920, height: 820 });
    // waiting for the resize-observer to fire, TODO: maybe remove
    await page.waitForTimeout(100);
    await si.runVisualAndA11yTests('large');

    await page.getByLabel('Name').fill('a');

    await page
      .locator('si-form-item')
      .filter({ hasText: 'Arrival' })
      .locator('input[aria-label="Hours"]')
      .fill('9');
    await page
      .locator('si-form-item')
      .filter({ hasText: 'Arrival' })
      .locator('input[aria-label="Minutes"]')
      .fill('9');
    await page
      .locator('si-form-item')
      .filter({ hasText: 'Departure' })
      .locator('input[aria-label="Hours"]')
      .fill('8');
    await page
      .locator('si-form-item')
      .filter({ hasText: 'Departure' })
      .locator('input[aria-label="Minutes"]')
      .fill('8');
    await page
      .locator('si-form-item')
      .filter({ hasText: 'Phone number' })
      .locator('input')
      .fill('5');
    // Without this, the test fails, because the dropdown does not open.
    // But:
    // - playwright says it can click the dropdown (and it gets the focus)
    // - deleting all other interactions before also solves the problem
    // - yet the problem is that there are too many actions before. If there are only three, it still works.
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    const firstClass = await page.locator('si-select-input').filter({ hasText: 'First class' });
    await firstClass.click();
    const listboxId = await firstClass.getAttribute('aria-controls');
    const economyOption = page.locator(`#${listboxId}`).getByText('Economy');
    await economyOption.click();
    // Same issue basically as above
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());

    await page.getByText('Save').click();

    await si.runVisualAndA11yTests('large-validated');
  });
});
