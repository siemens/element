/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test('maplibre/maplibre-cluster', ({ si }) =>
  si.static({
    skipAriaSnapshot: true,
    waitCallback: async page => {
      const markers = page.locator('si-cluster-marker .cluster-marker');
      await markers.first().waitFor({ state: 'visible' });

      await expect
        .poll(async () => {
          const gradients = await markers.evaluateAll(elements =>
            elements.map(element => element.style.getPropertyValue('--si-cluster-gradient'))
          );
          const gradientText = gradients.join('\n');
          return {
            caution: gradientText.includes('var(--si-sys-background-caution)'),
            danger: gradientText.includes('var(--si-sys-background-danger)'),
            success: gradientText.includes('var(--si-sys-background-success)')
          };
        })
        .toEqual({ caution: true, danger: true, success: true });
    }
  }));
