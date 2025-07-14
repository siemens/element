/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('Popover', () => {
  const example = 'si-popover-next/si-popover-next';

  ['top', 'end', 'start', 'bottom'].forEach(direction => {
    test(direction, async ({ page, si }) => {
      await si.visitExample(example);

      await page.locator('.btn').getByText(`Popover on ${direction}`).click();
      await expect(page.locator('.popover')).toBeVisible();

      await si.runVisualAndA11yTests(direction);
      await page.locator('.popover').click();
    });
  });

  ['with template', 'with template and context'].forEach(template => {
    test(template, async ({ page, si }) => {
      await si.visitExample(example);

      await page.locator('.btn').getByText(`Popover ${template}`).first().click();
      await expect(page.locator('.popover')).toBeVisible();

      await si.runVisualAndA11yTests(template);
      await page.locator('.popover').click();
    });
  });

  test('focus on wrapper', async ({ page, si }) => {
    await si.visitExample(example);

    await page.locator('.btn').getByText(`Popover on top`).press('Space');
    await expect(page.locator('.popover')).toBeVisible();

    await si.runVisualAndA11yTests('focus on wrapper');
  });

  test('focus on first focusable', async ({ page, si }) => {
    await si.visitExample(example);

    await page.locator('.btn').getByText(`Popover ${'with template'}`).first().press('Space');
    await expect(page.locator('.popover')).toBeVisible();

    await si.runVisualAndA11yTests('focus on first focusable');
  });
});
