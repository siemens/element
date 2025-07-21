/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-tour', () => {
  const example = 'si-tour/si-tour';

  test(example, async ({ page, si }) => {
    const nextClick = (): Promise<any> =>
      page.locator('si-tour button', { hasText: 'Next' }).click();

    await si.visitExample(example);
    await expect(page.locator('.tour-content')).toBeVisible();
    await si.runVisualAndA11yTests('first-step');

    await nextClick();
    await expect(page.locator('.tour-content')).toBeVisible();
    await si.runVisualAndA11yTests('second-step');

    await nextClick();
    await nextClick();
    await nextClick();
    await nextClick();
    await expect(page.locator('.tour-content')).toBeVisible();
    await si.runVisualAndA11yTests('open-menu');
    await nextClick();
    await expect(page.locator('.tour-content')).toBeVisible();
    await si.runVisualAndA11yTests('last-step');
  });
});
