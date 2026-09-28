/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-weather-widget', () => {
  const example = 'si-dashboard/si-weather-widget';
  const bodyExample = 'si-dashboard/si-weather-widget-body';
  const configurableExample = 'si-dashboard/si-weather-widget-configurable';

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

  test(
    configurableExample + ' selects an OpenWeather suggestion with the keyboard',
    async ({ page, si }) => {
      await page.route('https://api.openweathermap.org/geo/1.0/direct?**', route =>
        route.fulfill({
          json: [{ name: 'Zug', state: 'Canton of Zug', country: 'CH', lat: 47.1662, lon: 8.5155 }]
        })
      );
      await page.route('https://api.openweathermap.org/data/2.5/weather?**', route =>
        route.fulfill({
          json: {
            dt: 1767254400,
            weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
            main: { temp: 21.2, temp_min: 18.4, temp_max: 23.8, humidity: 52 },
            wind: { speed: 2.5 },
            clouds: { all: 5 },
            sys: { sunrise: 0, sunset: 0 },
            name: 'Zug'
          }
        })
      );
      await page.route('https://api.openweathermap.org/data/2.5/forecast?**', route =>
        route.fulfill({
          json: {
            list: [
              {
                dt: 1767254400,
                dt_txt: '2026-01-01 12:00:00',
                weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
                main: { temp: 21.2, temp_min: 18.4, temp_max: 23.8 }
              }
            ],
            city: { sunrise: 0, sunset: 0 }
          }
        })
      );

      await si.visitExample(configurableExample);
      await page.getByText('OpenWeather', { exact: true }).click();
      await page.getByLabel('OpenWeather API key').fill('dummy-api-key');
      const search = page.getByRole('button', { name: 'Search' });
      await search.click();

      const suggestion = page.getByRole('button', { name: 'Zug, Canton of Zug, CH' });
      await expect(suggestion).toBeVisible();
      await expect(
        page.locator('ul.list.list-divider.card > li > button', {
          hasText: 'Zug, Canton of Zug, CH'
        })
      ).toHaveCount(1);

      await expect(search).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(suggestion).toBeFocused();
      await si.runVisualAndA11yTests('suggestions');
      await page.keyboard.press('Enter');

      await expect(page.getByText('Showing: Zug, Canton of Zug, CH')).toBeVisible();
      await expect(page.locator('.si-weather-widget-temperature')).toContainText('21°C');
      await expect(suggestion).toBeHidden();
    }
  );
});
