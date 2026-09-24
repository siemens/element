/**
 * Copyright (c) Siemens 2016 - 2026
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

  test(example + 'component column overflow', async ({ page, si }) => {
    await si.visitExample(example);
    const column = page.getByRole('columnheader', { name: 'Component' });
    const handle = column.locator('.resize-handle');
    const columnBox = (await column.boundingBox())!;
    const handleBox = (await handle.boundingBox())!;
    const x = handleBox.x + handleBox.width / 2;
    const y = handleBox.y + handleBox.height / 2;

    await handle.hover();
    await page.mouse.down();
    // The resize drag measures clientWidth, while boundingBox includes the 1px border.
    await page.mouse.move(x + 59 - columnBox.width, y, { steps: 10 });
    await page.mouse.up();

    await expect.poll(async () => (await column.boundingBox())!.width).toBeCloseTo(60, 0);
    await si.runVisualAndA11yTests('component-column-overflow', {
      axeRulesSet: [{ id: 'aria-required-children', enabled: false }]
    });
  });
});
