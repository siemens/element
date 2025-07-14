/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('Popover', () => {
  const example = 'si-popover/si-popover';

  ['top', 'end', 'start', 'bottom'].forEach(direction => {
    test(direction, async ({ page, si }) => {
      await si.visitExample(example);

      await page.locator('.btn').getByText(`Popover on ${direction}`).click();
      await expect(page.locator('.popover')).toBeVisible();

      await si.runVisualAndA11yTests(direction);
      await page.locator('.popover').click();
    });
  });

  ['with template', 'with template and context'].forEach(direction => {
    test(direction, async ({ page, si }) => {
      await si.visitExample(example);

      await page.locator('.btn').getByText(`Popover ${direction}`).first().click();
      await expect(page.locator('.popover')).toBeVisible();

      await si.runVisualAndA11yTests(direction);
      await page.locator('.popover').click();
    });
  });
});
