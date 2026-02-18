/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('Popover', () => {
  const example = 'si-popover-legacy/si-popover-legacy';

  ['top', 'end', 'start', 'bottom'].forEach(direction => {
    test(direction, async ({ page, si }) => {
      await si.visitExample(example);

      const trigger = page.getByRole('button', { name: `Popover on ${direction}`, exact: true });
      await trigger.hover({ position: { x: 10, y: 10 } });
      await trigger.click({ position: { x: 10, y: 10 } });
      await expect(page.locator('.popover')).toBeVisible();

      await si.runVisualAndA11yTests(direction);
    });
  });

  ['with template', 'with template and context'].forEach(direction => {
    test(direction, async ({ page, si }) => {
      await si.visitExample(example);

      await page.getByRole('button', { name: `Popover ${direction}`, exact: true }).press('Space');
      await expect(page.locator('.popover')).toBeVisible();

      await si.runVisualAndA11yTests(direction);
    });
  });
});
