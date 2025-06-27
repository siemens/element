/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('datatable', () => {
  const example = 'datatable/datatable';

  test(example, async ({ page, si }) => {
    await si.visitExample(example);
    await si.runVisualAndA11yTests();
    const ageInput = page.getByRole('row', { name: 'First 1' }).getByRole('textbox');
    await ageInput.fill('1');
    await ageInput.blur();
    await ageInput.hover();
    await si.runVisualAndA11yTests('invalid-age');
  });

  const exampleTree = 'datatable/datatable-tree';

  test(exampleTree, async ({ page, si }) => {
    await si.visitExample(exampleTree);
    const button = page.locator('.datatable-tree-button').first();
    await button.click();
    await button.blur();
    await expect(page.locator('.datatable-icon-down').first()).toBeVisible();
    await si.runVisualAndA11yTests();
  });
});
