/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

for (const useDropLine of [false, true]) {
  const placeholder = useDropLine ? 'drop-line-placeholder' : 'normal-placeholder';

  test(`drag-drop/drag-drop ${placeholder}`, async ({ page, si }) => {
    await si.visitExample('drag-drop/drag-drop');
    if (useDropLine) {
      await page.getByRole('switch', { name: 'Use drop line placeholder' }).check();
    }

    const item = page.getByRole('listbox', { name: 'List one' }).getByRole('option').first();
    const itemBox = (await item.boundingBox())!;

    await page.mouse.move(itemBox.x + itemBox.width / 2, itemBox.y + itemBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(itemBox.x + itemBox.width / 2, itemBox.y + itemBox.height + 10, {
      steps: 10
    });

    await expect(page.locator('.cdk-drag-preview')).toBeVisible();
    await si.runVisualAndA11yTests(placeholder, {
      // CDK temporarily renders option clones outside their listboxes while dragging.
      axeRulesSet: [{ id: 'aria-required-parent', enabled: false }]
    });
    await page.mouse.up();
  });
}
