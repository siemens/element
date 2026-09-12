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

test('maplibre/maplibre marker accessibility', async ({ page, si }) => {
  await si.visitExample('maplibre/maplibre');

  const marker = page.locator('.maplibregl-marker').first();
  const markerButton = marker.getByRole('button');

  await expect(markerButton).toBeVisible();
  await expect(page.locator('.maplibregl-marker[tabindex]')).toHaveCount(0);
  await expect(markerButton).toHaveAttribute('aria-label', /Show details for/);
  await expect(markerButton).toHaveAttribute('aria-haspopup', 'dialog');
  await expect(markerButton).toHaveAttribute('aria-expanded', 'false');

  await markerButton.click();

  const popup = page.locator('.maplibregl-popup');
  await expect(popup.getByRole('dialog')).toBeVisible();
  await expect(markerButton).toHaveAttribute('aria-expanded', 'true');
  await expect(markerButton).toHaveAttribute('aria-controls', 'marker-details-dialog');
  await expect(page.locator('.maplibregl-marker[tabindex]')).toHaveCount(0);

  const closeButton = popup.getByRole('button', { name: 'Close popup' });
  await expect(closeButton).toBeFocused();

  await closeButton.click();

  await expect(popup).toHaveCount(0);
  await expect(markerButton).toHaveAttribute('aria-expanded', 'false');
  await expect(markerButton).toBeFocused();

  await markerButton.press('Space');
  await expect(popup.getByRole('dialog')).toBeVisible();

  await popup.getByRole('button', { name: 'Close popup' }).press('Escape');

  await expect(popup).toHaveCount(0);
  await expect(markerButton).toBeFocused();
});
