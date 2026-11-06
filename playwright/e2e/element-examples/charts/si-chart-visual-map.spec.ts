/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../../support/test-helpers';

const EXAMPLE = 'si-charts/generic/generic-custom';

test.describe('si-chart visual map', () => {
  test(EXAMPLE, async ({ page, si }) => {
    await si.visitExample(EXAMPLE);

    // Wait for the chart to be fully initialized
    await page.waitForFunction(() => {
      const chartEl = document.querySelector('si-chart');
      if (!chartEl) return false;
      const component = (window as any).ng?.getComponent(chartEl);
      return !!component?.chart;
    });

    // Set a specific range on the visual map slider
    await page.evaluate(() => {
      const chartEl = document.querySelector('si-chart')!;
      const component = (window as any).ng.getComponent(chartEl);
      component.chart.dispatchAction({
        type: 'selectDataRange',
        visualMapIndex: 0,
        selected: [50, 200]
      });
    });

    await si.runVisualAndA11yTests('range-set', { skipAriaSnapshot: true });

    // Trigger theme switch directly on the component
    await page.evaluate(() => {
      const chartEl = document.querySelector('si-chart')!;
      const component = (window as any).ng.getComponent(chartEl);
      component.themeSwitch();
    });

    // Verify the visual map range is retained after the theme switch
    const range = await page.evaluate(() => {
      const chartEl = document.querySelector('si-chart')!;
      const component = (window as any).ng.getComponent(chartEl);
      return component.getOptionNoClone().visualMap[0].range;
    });

    expect(range).toEqual([50, 200]);

    await si.runVisualAndA11yTests('range-retained-after-theme-switch', { skipAriaSnapshot: true });
  });
});
