/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-about', () => {
  const example = 'si-about/si-about-api';

  test('expanded license file content', async ({ page, si }) => {
    await si.visitExample(example);

    const licenseCategory = page.locator('.license-api').first();
    await licenseCategory.getByRole('button').first().click();
    await expect(licenseCategory.locator('.license-api-file').first()).toBeVisible();

    const licenseFile = licenseCategory.locator('.license-api-file').first();
    await licenseFile.getByRole('button').click();
    await expect(licenseFile.locator('.license-api-file-content')).toBeVisible();

    await si.runVisualAndA11yTests();
  });
});
