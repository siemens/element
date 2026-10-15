/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-split', () => {
  const example = 'si-split/si-split-auto';
  ['rtl', 'ltr'].forEach(direction => {
    test(`collapse part (${direction.toUpperCase()})`, async ({ page, si }) => {
      await si.visitExample(example);
      await page.evaluate(dir => document.documentElement.setAttribute('dir', dir), direction);

      const filtersPart = page.locator('si-split-part').filter({ hasText: 'Filters' });
      await filtersPart.getByRole('button', { name: 'Collapse', exact: true }).click();
      await expect(filtersPart.getByText('Split Part #1')).toBeHidden();
      await si.runVisualAndA11yTests(`collapsed-${direction}`);
    });
  });

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
