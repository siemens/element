/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { test } from '../../support/test-helpers';

test.describe('si-layouts', () => {
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
