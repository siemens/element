/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { type StaticTestOptions, test } from '../../../support/test-helpers';

// To iron out platform differences.
const options: StaticTestOptions = { maxDiffPixels: 10 };

test.beforeEach(async ({ page }) => {
  await page.route('https://api.maptiler.com/maps/voyager/style.json?*', route => {
    return route.fulfill({ json: {} });
  });
  await page.route('https://api.maptiler.com/tiles/v3/tiles.json?*', route => {
    return route.fulfill({
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
    });
  });
  await page.route('https://api.maptiler.com/maps/*/sprite.json', route => {
    return route.fulfill({
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
    });
  });
});

test('si-map/si-map-custom-popover-onhover', ({ si }) => si.static(options));
test('si-map/si-map-custom-popover', ({ si }) => si.static(options));
test('si-map/si-map-custom-style', ({ si }) => si.static(options));
test('si-map/si-map-custom-zoom-levels', ({ si }) => si.static(options));
test('si-map/si-map-default-style', ({ si }) => si.static(options));
test('si-map/si-map-grouping', ({ si }) => si.static(options));
test('si-map/si-map-labels', ({ si }) => si.static(options));
