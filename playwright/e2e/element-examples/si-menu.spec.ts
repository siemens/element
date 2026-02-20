/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { test } from '../../support/test-helpers';

test.describe('si-menu', () => {
  const examples = ['si-menu/si-menu', 'si-menu/si-menu-factory-legacy', 'si-menu/si-menu-factory'];
  examples.forEach(example => {
    test(example, async ({ page, si }) => {
      await page.setViewportSize({ width: 760, height: 600 });
      await si.visitExample(example, false);
      await page.getByRole('button', { name: 'Menu' }).click();
      await si.runVisualAndA11yTests('dropdown');
    });
  });

  const example1 = 'si-menu/si-menu-full-options';
  test(example1, async ({ page, si }) => {
    await si.visitExample(example1);
    await si.runVisualAndA11yTests();
  });

  const example2 = 'si-menu/si-menu-bar';
  test(example2, async ({ page, si }) => {
    await si.visitExample(example2);
    await page.getByText('Item 1').click();
    await si.runVisualAndA11yTests();
  });
});
