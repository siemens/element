/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { test as baseTest } from './test-helpers';

export const testMap = baseTest.extend<{ mockMapTiler: void }>({
  mockMapTiler: [
    async ({ page }, use) => {
      await page.route('https://api.maptiler.com/maps/voyager/style.json?*', route =>
        route.fulfill({ json: {} })
      );
      await page.route('https://api.maptiler.com/tiles/v3/tiles.json?*', route =>
        route.fulfill({
          json: {
            'id': 'test-fixture',
            'bounds': [-180, -85.0511, 180, 85.0511],
            'center': [0, 0, 1],
            'format': 'pbf',
            'tilejson': '2.1.0',
            'minzoom': 15,
            'maxzoom': 15,
            'tiles': []
          }
        })
      );
      await page.route('https://api.maptiler.com/maps/*/sprite.json', route =>
        route.fulfill({
          json: {
            'circle-11': {
              'height': 17,
              'pixelRatio': 1,
              'width': 17,
              'x': 0,
              'y': 0
            },
            'star-11': {
              'height': 17,
              'pixelRatio': 1,
              'width': 17,
              'x': 17,
              'y': 0
            }
          }
        })
      );

      await use();
    },
    { auto: true }
  ]
});
