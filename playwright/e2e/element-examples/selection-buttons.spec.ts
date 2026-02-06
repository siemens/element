/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('selection-buttons tooltip', () => {
  const example = 'buttons/selection-buttons';

  test('icon-only with tooltip on focus', async ({ page, si }) => {
    await si.visitExample(example);

    const fullScreenButton = page.getByRole('radio', { name: 'Full-screen' });
    await fullScreenButton.focus();

    await expect(page.locator('si-tooltip')).toBeVisible();
    await expect(page.locator('si-tooltip')).toContainText('Full-screen');

    await si.runVisualAndA11yTests('selection-button-icon-tooltip-focus');
  });

  test('icon-only with tooltip on hover', async ({ page, si }) => {
    await si.visitExample(example);

    const sidebarButton = page.getByRole('radio', { name: 'Sidebar' });
    await sidebarButton.hover();

    await expect(page.locator('si-tooltip')).toBeVisible();
    await expect(page.locator('si-tooltip')).toContainText('Sidebar');

    await si.runVisualAndA11yTests('selection-button-icon-tooltip-hover');
  });
});
