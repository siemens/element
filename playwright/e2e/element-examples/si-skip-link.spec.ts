/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { test } from '../../support/test-helpers';

test.describe('si-skip-links', () => {
  const example = 'si-skip-links/si-skip-links';

  test(example, async ({ page, si }) => {
    await si.visitExample(example);
    await page.locator('.skip-link').filter({ hasText: 'Jump to Target 1' }).focus();

    await si.runVisualAndA11yTests();
  });
});
