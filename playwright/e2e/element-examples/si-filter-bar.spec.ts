/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { test } from '../../support/test-helpers';

test.describe('si-filter-bar', () => {
  const example = 'si-filter-bar/si-filter-bar';

  test(example, async ({ page, si }) => {
    await si.visitExample(example, false);

    await si.runVisualAndA11yTests('l');

    await page.setViewportSize({ width: 500, height: 1076 });

    await si.runVisualAndA11yTests('xs');

    await page.setViewportSize({ width: 750, height: 1076 });

    await si.runVisualAndA11yTests('s');
  });
});
