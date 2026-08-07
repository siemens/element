/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { test } from '../../support/test-helpers';

test.describe('si-source-chip', () => {
  const example = 'si-source-chip/si-source-chip';

  test('source chip with open popover', async ({ page, si }) => {
    await si.visitExample(example);
    await si.runVisualAndA11yTests();

    await page.locator('si-source-chip').getByText('Sources').click();
    await page.mouse.move(0, 0);
    await si.runVisualAndA11yTests('open');
  });
});
