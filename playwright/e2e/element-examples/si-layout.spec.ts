/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { test } from '../../support/test-helpers';

test.describe('si-layouts', () => {
  test('si-layouts/anatomy - fullscreen side panel', async ({ page, si }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await si.visitExample('si-layouts/anatomy');

    await page.getByRole('button', { name: 'Show side pane', exact: true }).click();
    await page.getByRole('button', { name: 'Full screen', exact: true }).click();
    await si.runVisualAndA11yTests('side-panel-fullscreen-navbar-expanded');
    await page.getByRole('button', { name: 'collapse', exact: true }).click();
    await si.runVisualAndA11yTests('side-panel-fullscreen');
  });

  const example = 'si-layouts/content-tile-layout-full-scroll-vertical-nav';

  test(example, async ({ page, si }) => {
    await si.visitExample(example);

    await si.waitForAllAnimationsToComplete();
    await si.runVisualAndA11yTests();

    await page.locator('.mobile-drawer button').click();

    await si.waitForAllAnimationsToComplete();
    await si.runVisualAndA11yTests('navbar-collapsed');
  });
});

test.describe('si-layouts', () => {
  const example = 'si-layouts/content-1-2-layout-fixed-height';

  test(example, async ({ page, si }) => {
    await si.visitExample(example, false);

    // this sucks, but need to wait for the rendering to settle (see simpl-charts)
    await page.waitForTimeout(1000);
    await si.waitForAllAnimationsToComplete();
    // TODO: Make more stable and remove custom threshold
    await si.runVisualAndA11yTests(undefined, {
      axeRulesSet: [{ id: 'scrollable-region-focusable', enabled: false }]
    });

    await page.setViewportSize({ width: 1000, height: 1200 });
    // this sucks, but need to wait for the rendering to settle (see simpl-charts)
    await page.waitForTimeout(1000);
    await si.waitForAllAnimationsToComplete(3);
    // TODO: Make more stable and remove custom threshold
    await si.runVisualAndA11yTests('resized', {
      axeRulesSet: [{ id: 'scrollable-region-focusable', enabled: false }]
    });
  });
});
