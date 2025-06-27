/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-status-bar', () => {
  const example = 'si-status-bar/si-status-bar';
  const exampleCollapsible = 'si-status-bar/si-status-bar-custom';

  test(example, async ({ page, si }) => {
    await page.setViewportSize({ width: 1200, height: 200 });
    await si.visitExample(example, false);
    await page.getByText('Pause blinking').click();

    await si.runVisualAndA11yTests();

    await page.getByText('Compact mode').click();
    await expect(page.locator('.compact').first()).toBeVisible();
    await si.runVisualAndA11yTests('compact');
  });

  test(exampleCollapsible, async ({ page, si }) => {
    await si.visitExample(exampleCollapsible);
    await page.getByText('Pause blinking').click();

    await si.runVisualAndA11yTests('collapsed');

    const toggle = page.locator('.collapse-expand');
    await toggle.click();
    await toggle.blur();
    await expect(page.locator('.main-content .flex-wrap')).toBeVisible();
    await si.runVisualAndA11yTests('open');
  });
});
