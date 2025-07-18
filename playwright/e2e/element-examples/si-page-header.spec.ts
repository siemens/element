/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { test } from '../../support/test-helpers';

test.describe('si-page-header', () => {
  const example = 'si-page-header/si-page-header';

  test('should show everything on large screens', async ({ page, si }) => {
    await si.visitExample(example);
    await si.runVisualAndA11yTests('large');
  });

  test('should show everything on small screens', async ({ page, si }) => {
    await page.setViewportSize({ width: 320, height: 480 });
    await si.visitExample(example, false);
    await si.runVisualAndA11yTests('small');
  });

  test('should show indented navigation with vertical-nav', async ({ page, si }) => {
    await page.setViewportSize({ width: 320, height: 480 });
    await si.visitExample(example, false);
    await page.locator('label').getByText('Status').click();
    await si.runVisualAndA11yTests('small-nav-indented');
    await page.locator('label').getByText('Breadcrumb').click();
    await si.runVisualAndA11yTests('small-title-indented');
  });
});
