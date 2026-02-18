/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('selection-buttons tooltip', () => {
  const example = 'buttons/selection-buttons';

  test('icon-only with tooltip on focus', async ({ page, si }) => {
    await si.visitExample(example);

    const onePaneButton = page.getByRole('radio', { name: 'One pane' });
    await onePaneButton.focus();

    await expect(page.locator('si-tooltip')).toBeVisible();
    await expect(page.locator('si-tooltip')).toContainText('One pane');

    await si.runVisualAndA11yTests('selection-button-icon-tooltip-focus');
  });

  test('icon-only with tooltip on hover', async ({ page, si }) => {
    await si.visitExample(example);

    const twoPanesButton = page.getByRole('radio', { name: 'Two panes' });
    await twoPanesButton.hover();

    await expect(page.locator('si-tooltip')).toBeVisible();
    await expect(page.locator('si-tooltip')).toContainText('Two panes');

    await si.runVisualAndA11yTests('selection-button-icon-tooltip-hover');
  });
});
