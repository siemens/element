/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-weather-widget', () => {
  const example = 'si-dashboard/si-weather-widget';
  const bodyExample = 'si-dashboard/si-weather-widget-body';

  test(example, async ({ page, si }) => {
    await si.visitExample(example);
    // Wait for all illustrations (resolved through the example resolver) to
    // either render as <img>s or as masked <span>s. Both end up inside the
    // weather widget root, so any temperature being visible is a reliable
    // signal that the body finished rendering.
    await expect(page.locator('si-weather-widget').first()).toBeVisible();
    await expect(page.locator('.si-weather-widget-temperature').first()).toBeVisible();
    await si.runVisualAndA11yTests();
  });

  test(example + ' tablet-portrait', async ({ page, si }) => {
    await page.setViewportSize({ width: 768, height: 1600 });
    await si.visitExample(example, false);
    await expect(page.locator('.si-weather-widget-temperature').first()).toBeVisible();
    await si.runVisualAndA11yTests('tablet-portrait');
  });

  test(example + ' tablet-landscape', async ({ page, si }) => {
    await page.setViewportSize({ width: 1024, height: 1200 });
    await si.visitExample(example, false);
    await expect(page.locator('.si-weather-widget-temperature').first()).toBeVisible();
    await si.runVisualAndA11yTests('tablet-landscape');
  });

  test(example + ' mobile', async ({ page, si }) => {
    await page.setViewportSize({ width: 375, height: 2400 });
    await si.visitExample(example, false);
    await expect(page.locator('.si-weather-widget-temperature').first()).toBeVisible();
    await si.runVisualAndA11yTests('mobile');
  });

  test(bodyExample, async ({ page, si }) => {
    await si.visitExample(bodyExample);
    await expect(page.locator('si-weather-widget-body').first()).toBeVisible();
    await expect(page.locator('.si-weather-widget-temperature').first()).toBeVisible();
    await si.runVisualAndA11yTests();
  });

  test(bodyExample + ' mobile', async ({ page, si }) => {
    await page.setViewportSize({ width: 375, height: 1600 });
    await si.visitExample(bodyExample, false);
    await expect(page.locator('.si-weather-widget-temperature').first()).toBeVisible();
    await si.runVisualAndA11yTests('mobile');
  });
});
