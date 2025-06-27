/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { test } from '../../support/test-helpers';

test.describe('si-color-picker', () => {
  const example = 'si-color-picker/si-color-picker';

  test(example, async ({ page, si }) => {
    await si.visitExample(example);
    await page.locator('si-color-picker').click();
    await si.runVisualAndA11yTests();
  });
});
