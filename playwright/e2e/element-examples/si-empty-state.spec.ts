/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { test } from '../../support/test-helpers';

test.describe('si-empty-state', () => {
  const example = 'si-empty-state/si-empty-state';

  test('responsive - icon hidden', async ({ page, si }) => {
    await page.setViewportSize({ width: 1000, height: 215 });
    await si.visitExample(example, false);
    await si.runVisualAndA11yTests('icon-hidden');
  });

  test('responsive - icon and content hidden', async ({ page, si }) => {
    await page.setViewportSize({ width: 1000, height: 135 });
    await si.visitExample(example, false);
    await si.runVisualAndA11yTests('icon-and-content-hidden');
  });
});

test.describe('si-empty-state no actions', () => {
  const example = 'si-empty-state/si-empty-state-no-actions';

  test('responsive - icon hidden', async ({ page, si }) => {
    await page.setViewportSize({ width: 1000, height: 159 });
    await si.visitExample(example, false);
    await si.runVisualAndA11yTests('icon-hidden');
  });

  test('responsive - icon and content hidden', async ({ page, si }) => {
    await page.setViewportSize({ width: 1000, height: 79 });
    await si.visitExample(example, false);
    await si.runVisualAndA11yTests('icon-and-content-hidden');
  });
});
