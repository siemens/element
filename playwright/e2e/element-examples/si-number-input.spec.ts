/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { test } from '../../support/test-helpers';

test.describe('si-number-input', () => {
  const example = 'si-number-input/si-number-input';
  test(example, async ({ page, si }) => {
    await si.visitExample(example);
    await si.runVisualAndA11yTests();
    const input = page.getByLabel('Number input');
    await input.clear();
    await input.blur();
    await si.runVisualAndA11yTests('invalid-with-buttons');
    await page.getByLabel('-/+ Buttons').click();
    await si.runVisualAndA11yTests('invalid-without-buttons');
  });
});
