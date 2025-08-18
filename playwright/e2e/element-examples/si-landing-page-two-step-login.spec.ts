/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-landing-page-two-step-login', () => {
  const example = 'si-landing-page/si-landing-page-two-step-login';

  test(example, async ({ page, si }) => {
    const nextClick = (): Promise<any> => page.locator('button', { hasText: 'Next' }).click();

    await si.visitExample(example);
    await page.setViewportSize({ width: 1000, height: 794 });

    const username = page.getByLabel('username');
    await username.fill('name@siemens.com');

    await expect(page.getByLabel('username')).toBeVisible();
    await si.runVisualAndA11yTests('first-step');

    await nextClick();
    await expect(page.getByRole('textbox', { name: 'password' })).toBeVisible();
    await si.runVisualAndA11yTests('second-step');
  });
});
