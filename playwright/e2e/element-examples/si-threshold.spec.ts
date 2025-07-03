/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { test } from '../../support/test-helpers';

test.describe('si-threshold', () => {
  const example = 'si-threshold/si-threshold';

  test(example + ' vertical', async ({ page, si }) => {
    await si.visitExample(example);

    await si.runVisualAndA11yTests('vertical');

    await page.getByText('Can add/remove steps').click();
    await si.runVisualAndA11yTests('vertical-noaddremove');

    await page.getByText('Readonly', { exact: true }).click();
    await si.runVisualAndA11yTests('vertical-readonly');
  });

  test(example + ' horizontal', async ({ page, si }) => {
    await si.visitExample(example, false);

    await page.getByText('Horizontal layout').click();
    await page.getByText('Can wrap').click();

    await si.runVisualAndA11yTests('horizontal');

    await page.getByText('Can add/remove steps').click();
    await si.runVisualAndA11yTests('horizontal-noaddremove');

    await page.getByText('Readonly', { exact: true }).click();
    await si.runVisualAndA11yTests('horizontal-readonly');
  });
});
