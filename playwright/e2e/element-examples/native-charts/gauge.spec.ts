/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { test } from '../../../support/test-helpers';

test.describe('ncharts-gauge', () => {
  const multipleValuesExample = 'si-ncharts/si-nchart-gauge';
  const singleValuesExample = 'si-ncharts/si-nchart-gauge-single';

  test(multipleValuesExample, async ({ page, si }) => {
    await si.visitExample(multipleValuesExample);

    await si.runVisualAndA11yTests('positive-positive');

    await page.getByText('Negative - Negative').click();
    await si.runVisualAndA11yTests('negative-negative');

    await page.getByText('Negative - Positive').click();
    await si.runVisualAndA11yTests('negative-positive');

    await page.getByLabel('Legend position').selectOption({ label: 'In a column' });
    await page.getByLabel('Min. decimals').fill('1');
    await si.runVisualAndA11yTests('legend-column');

    await page.getByLabel('Show range labels outside').check();
    await page.getByLabel('Num. axis decimals').fill('1');
    await page.getByLabel('Show legend').uncheck();
    await page.getByLabel('Show ticks').uncheck();

    await si.runVisualAndA11yTests('outside-range-labels');
  });

  test(singleValuesExample, async ({ page, si }) => {
    await si.visitExample(singleValuesExample);

    await si.runVisualAndA11yTests('segments-1');

    await page.getByText('Value 15').click();
    await si.runVisualAndA11yTests('segments-2');

    await page.getByText('Value 80').click();
    await si.runVisualAndA11yTests('segments-3');

    await page.getByLabel('Show range labels outside').check();
    await page.getByLabel('Min. decimals').fill('1');
    await page.getByLabel('Num. axis decimals').fill('1');
    await page.getByLabel('Show ticks').uncheck();

    await si.runVisualAndA11yTests('outside-range-labels');

    await page.getByLabel('Show segments').uncheck();
    await si.runVisualAndA11yTests('no-segments');
  });
});
