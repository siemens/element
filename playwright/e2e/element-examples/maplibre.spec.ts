/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { testMap } from '../../support/maptiler-mock';
import { expect, test } from '../../support/test-helpers';

testMap('maplibre/maplibre-cluster', ({ si }) =>
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
            caution: gradientText.includes('var(--si-sys-color-background-caution)'),
            danger: gradientText.includes('var(--si-sys-color-background-danger)'),
            success: gradientText.includes('var(--si-sys-color-background-success)')
          };
        })
        .toEqual({ caution: true, danger: true, success: true });
    }
  })
);

testMap('maplibre cluster popover', async ({ page, si }) => {
  await si.visitExample('maplibre/maplibre-cluster');
  const name = 'Cluster with 11 locations';
  await page.getByRole('button', { name, exact: true }).click();

  const popover = page.getByRole('dialog', { name, exact: true });
  await expect(popover).toBeVisible();

  const scrollRegion = page.getByRole('region', { name: 'Cluster locations' });
  const lastItem = scrollRegion.getByRole('listitem').last();
  await lastItem.scrollIntoViewIfNeeded();
  await expect(popover.getByRole('button', { name: 'Load more', exact: true })).toBeEnabled();

  await page.mouse.move(-10, -10);
  await si.runVisualAndA11yTests('popover', { skipAriaSnapshot: true });
});
