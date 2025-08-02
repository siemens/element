/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { test } from '../../support/test-helpers';

test.describe('Help Button', () => {
  const example = 'si-help-button/si-help-button';

  test(example, async ({ si, page }) => {
    await si.visitExample(example);
    await page.getByRole('button', { name: 'How to calculate repo storage' }).click();
    await si.runVisualAndA11yTests();
  });
});
