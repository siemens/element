/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { test } from '../../support/test-helpers';

test.describe('si-photo-upload', () => {
  const example = 'si-photo-upload/si-photo-upload';
  const image =
    'data:image/png;base64,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';

  test(example + ' photo readonly', async ({ page, si }) => {
    await si.visitExample(example, false);
    await page.locator('#sourcePhoto').fill(image);

    await page.locator('#sourcePhoto').click();
    await si.runVisualAndA11yTests('readonly');
  });

  test(example + ' photo edit', async ({ page, si }) => {
    await si.visitExample(example, false);
    await page.getByRole('menuitem', { name: 'Edit' }).first().click();
    await page.locator('#sourcePhoto').fill(image);
    await si.runVisualAndA11yTests('edit');
  });
});
