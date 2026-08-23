/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-markdown', () => {
  const example = 'si-markdown/si-markdown';

  test('markdown renderer', async ({ page, si }) => {
    await page.setViewportSize({ width: 1200, height: 6950 });
    await si.visitExample(example);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('si-markdown')).toContainText('This is awesome');
    await si.runVisualAndA11yTests(undefined, {
      // TODO: remove after new code tokens are in placed
      axeRulesSet: [{ id: 'color-contrast', enabled: false }]
    });
  });
});
