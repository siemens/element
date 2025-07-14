/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-modal-service', () => {
  const example = 'si-modals/si-modal-service';

  test.afterEach(async ({ page }) => {
    await page.locator('[aria-label="Close modal"]').click();
  });

  test(example + ' base modal', async ({ page, si }) => {
    await si.visitExample(example);

    await page.locator('.btn').getByText('Create template modal').click();
    await expect(page.locator('.modal-body')).toBeVisible();

    await si.runVisualAndA11yTests();
  });

  test(example + ' modal with icon', async ({ page, si }) => {
    await si.visitExample(example);

    await page.locator('.btn').getByText('Create modal with icon').click();
    await expect(page.locator('.modal-body')).toBeVisible();

    await si.runVisualAndA11yTests('icon');
  });
});
