/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-main-detail-container', () => {
  const example = 'si-main-detail-container/si-main-detail-container';

  test(example, async ({ page, si }) => {
    await si.visitExample(example);
    await expect(page.getByText('Max Meier 8')).toHaveCount(1);
    await si.runVisualAndA11yTests(undefined, {
      axeRulesSet: [{ id: 'scrollable-region-focusable', enabled: false }]
    });
  });
});
