/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { test } from '../../support/test-helpers';

test.describe('shadow-root', () => {
  const example = 'si-shadow-root/si-shadow-root';

  test('on a large screen', async ({ page, si }) => {
    await si.visitExample(example);
    await page.getByRole('button', { name: 'Open dropdown' }).click();
    await si.runVisualAndA11yTests('', {
      axeRulesSet: [{ id: 'aria-hidden-focus', enabled: false }]
    });
  });
});
