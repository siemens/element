/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('datatable selection', () => {
  const example = 'datatable/datatable-selection';

  test(example, async ({ page, si }) => {
    test.setTimeout(60000);
    await si.visitExample(example);
    const row2 = page.getByRole('row').filter({ hasText: 'First 2' }).first();
    const row3 = page.getByRole('row').filter({ hasText: 'First 3' }).first();
    row2.click();
    const selectionCard = page.locator('si-card').first();
    await expect(selectionCard.getByText('First 2')).not.toBeVisible();
    await expect(selectionCard.getByText('None')).toBeVisible();

    const selectionDropdown = page.getByLabel('Selection type');
    await selectionDropdown.selectOption('single');

    row2.click();
    await expect(selectionCard.getByText('First 2')).toBeVisible();

    await si.runVisualAndA11yTests('single-selection', {
      axeRulesSet: [{ id: 'scrollable-region-focusable', enabled: false }]
    });

    await selectionDropdown.selectOption('checkbox');
    row3.getByRole('checkbox').click();

    await expect(selectionCard.getByText('First 2')).toBeVisible();
    await expect(selectionCard.getByText('First 3')).toBeVisible();

    await si.runVisualAndA11yTests('checkbox-selection', {
      axeRulesSet: [{ id: 'scrollable-region-focusable', enabled: false }]
    });
  });
});
