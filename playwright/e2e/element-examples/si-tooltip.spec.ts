/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('Tooltip', () => {
  const example = 'si-tooltip/si-tooltip';

  ['top', 'end', 'start', 'bottom'].forEach(direction => {
    test(direction, async ({ page, si }) => {
      await si.visitExample(example);

      await page.locator('.btn').getByText(`Tooltip on ${direction}`).dispatchEvent('mouseenter');
      await expect(page.locator('.tooltip')).toHaveCount(1);

      await si.runVisualAndA11yTests(direction);
    });
  });
});
