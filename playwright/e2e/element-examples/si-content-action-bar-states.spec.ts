/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-content-action-bar-states', () => {
  const example = 'si-content-action-bar/si-content-action-bar-states';

  test('long list', async ({ page, si }) => {
    await si.visitExample(example);
    await page.getByText('Long-List').first().click();
    await expect(page.locator('.dropdown-menu').first()).toBeVisible();
    await si.runVisualAndA11yTests();
  });
});
