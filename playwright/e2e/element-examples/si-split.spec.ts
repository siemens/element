/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { test } from '../../support/test-helpers';

test.describe('si-split', () => {
  const example = 'si-split/si-split-auto';
  test('add and remove part', async ({ page, si }) => {
    await si.visitExample(example);
    await si.runVisualAndA11yTests();
    await page.getByText('Toggle details').click();
    await si.runVisualAndA11yTests('collapsed');
    await page.locator('.si-split-gutter').hover();
    await page.mouse.down();
    await page.mouse.move(100, 0);
    await page.mouse.up();
    await si.runVisualAndA11yTests('moved');
    await page.getByText('Toggle details').click();
    await si.runVisualAndA11yTests('expanded');
  });
});
