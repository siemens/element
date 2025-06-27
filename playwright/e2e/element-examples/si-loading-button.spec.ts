/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-loading-button', () => {
  const example = 'si-loading-spinner/si-loading-button';

  test(example, async ({ page, si }) => {
    await si.visitExample(example);
    await si.runVisualAndA11yTests('normal state');

    await page.locator('input[type=checkbox]').check();
    const spinnerCount = await page.locator('si-loading-spinner').count();
    expect(spinnerCount).toBeGreaterThan(0);
    await si.runVisualAndA11yTests('second-step', { maxDiffPixels: 40 });
  });
});
