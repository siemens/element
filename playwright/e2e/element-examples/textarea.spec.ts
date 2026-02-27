/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { test } from '../../support/test-helpers';

test.describe('textarea', () => {
  const example = 'input-fields/multi-line';

  test(example, async ({ page, si }) => {
    await si.visitExample(example);

    await page
      .getByText('This is valid')
      .fill('This is valid\nThis is valid\nThis is valid\nThis is valid');

    await si.runVisualAndA11yTests('severity-icon-scrollbar');
  });
});
