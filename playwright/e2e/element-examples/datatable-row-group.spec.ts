/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('datatable', () => {
  const example = 'datatable/datatable-grouped-rows';

  test(example, async ({ page, si }) => {
    await si.visitExample(example);
    await si.runVisualAndA11yTests('default', {
      axeRulesSet: [
        {
          id: 'aria-required-children',
          enabled: false
        }
      ]
    });
  });

  test(example + 'collapsed', async ({ page, si }) => {
    await si.visitExample(example);
    const button = page.getByLabel('Collapse group').first();
    await button.click();
    await expect(page.getByText('Heater')).not.toBeVisible();
    await si.runVisualAndA11yTests('collapsed', {
      axeRulesSet: [
        {
          id: 'aria-required-children',
          enabled: false
        }
      ]
    });
  });

  test(example + 'group selection', async ({ page, si }) => {
    await si.visitExample(example);
    const checkbox = page.getByRole('checkbox', { name: 'Select row group' }).first();
    await checkbox.click();
    await si.runVisualAndA11yTests('group-selection', {
      axeRulesSet: [
        {
          id: 'aria-required-children',
          enabled: false
        }
      ]
    });
  });

  test(example + 'row selection', async ({ page, si }) => {
    await si.visitExample(example);
    const checkbox = page.getByRole('checkbox', { name: 'Select row', exact: true }).first();
    await checkbox.click();
    await si.runVisualAndA11yTests('row-selection', {
      axeRulesSet: [
        {
          id: 'aria-required-children',
          enabled: false
        }
      ]
    });
  });
});
