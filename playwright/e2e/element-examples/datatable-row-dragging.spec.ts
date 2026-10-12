/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('datatable row dragging', () => {
  const example = 'datatable/datatable-row-dragging';

  test(example + ' dragging', async ({ page, si }) => {
    await si.visitExample(example);

    const handle = page
      .getByRole('row', { name: 'Review client feedback' })
      .locator('.cdk-drag-handle');
    const handleBox = (await handle.boundingBox())!;
    const x = handleBox.x + handleBox.width / 2;
    const y = handleBox.y + handleBox.height / 2;

    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x, y + 70, { steps: 10 });

    await expect(page.locator('.cdk-drag-preview')).toBeVisible();
    await si.runVisualAndA11yTests('dragging', {
      axeRulesSet: [
        // The drag handle column has no header.
        { id: 'empty-table-header', enabled: false },
        // CDK temporarily moves the hidden original row out of the table while dragging.
        { id: 'aria-required-parent', enabled: false },
        { id: 'scrollable-region-focusable', enabled: false }
      ]
    });
    await page.mouse.up();
  });
});
