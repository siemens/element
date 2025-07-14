/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-tabs', () => {
  const example = 'si-tabs/si-tabs';

  test(example, async ({ page, si }) => {
    await si.visitExample(example);
    await page.locator('si-tabset button').getByText('Reception').click();
    await si.runVisualAndA11yTests();
    await page.locator('si-tabset .btn-ghost.close').first().click();
    await expect(page.locator('#si-tabset button').getByText('Reception')).toHaveCount(0);
    await si.runVisualAndA11yTests('delete');
  });
});
