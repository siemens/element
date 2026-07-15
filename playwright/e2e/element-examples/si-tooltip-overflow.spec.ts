/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test('si-tooltip/si-tooltip-overflow', async ({ page, si }) => {
  await si.visitExample('si-tooltip/si-tooltip-overflow');

  await page.getByRole('button', { name: 'A long time ago in a galaxy far, far away...' }).hover();
  await expect(page.getByRole('tooltip')).toBeVisible();
  await expect(page.getByRole('tooltip')).toHaveText(
    'A long time ago in a galaxy far, far away...'
  );

  await si.runVisualAndA11yTests('button-hover');
});
