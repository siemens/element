/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { test } from '../../support/test-helpers';

test.describe('password strength', () => {
  const example = 'input-fields/password';

  test(example, async ({ page, si }) => {
    await si.visitExample(example);
    const password = page.getByLabel('New Password');
    await password.fill('TestPassword');
    await password.blur();
    await si.runVisualAndA11yTests('invalid password');
  });

  test(example + ' valid password', async ({ page, si }) => {
    await si.visitExample(example);
    const password = page.getByLabel('New Password');
    await password.fill('SecurePassword123!');
    await password.blur();
    await si.runVisualAndA11yTests('valid password');
  });

  test(example + ' visibility toggle', async ({ page, si }) => {
    await si.visitExample(example);
    const password = page.getByLabel('New Password');
    await password.fill('TestPassword');
    await password.blur();
    const visibilityToggle = page.locator('si-password-strength').getByLabel('show password');
    await visibilityToggle.click();
    await si.runVisualAndA11yTests('visibility toggle');
  });
});
