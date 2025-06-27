/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { test } from '../../support/test-helpers';

test.describe('si-menu', () => {
  const examples = ['si-menu/si-menu', 'si-menu/si-menu-factory-legacy', 'si-menu/si-menu-factory'];
  examples.forEach(example => {
    test(example, async ({ page, si }) => {
      await page.setViewportSize({ width: 760, height: 600 });
      await si.visitExample(example, false);
      await page.locator('.cdk-menu-trigger').click();
      await si.runVisualAndA11yTests('dropdown');
    });
  });

  const example = 'si-menu/si-menu-bar';
  test(example, async ({ page, si }) => {
    await si.visitExample(example);
    await page.getByText('Item 1').click();
    await si.runVisualAndA11yTests();
  });
});
