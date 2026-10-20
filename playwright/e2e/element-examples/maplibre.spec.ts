/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { testMap } from '../../support/maptiler-mock';
import { expect, test } from '../../support/test-helpers';

// Temporary suppression tracked in #3014.
testMap('maplibre/maplibre-cluster', ({ si }) =>
  si.static({
    disabledA11yRules: ['label-content-name-mismatch'],
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

testMap('maplibre cluster zoom on click', async ({ page, si }) => {
  await si.visitExample('maplibre/maplibre-cluster');
  const cluster = page.getByRole('button', { name: 'Cluster with 11 locations', exact: true });
  await cluster.click();

  await expect(cluster).toBeHidden();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

testMap('maplibre cluster popover', async ({ page, si }) => {
  await si.visitExample('maplibre/maplibre-cluster');
  await page.getByRole('switch', { name: 'Zoom into clusters on click' }).uncheck();
  const name = 'Cluster with 11 locations';
  await page.getByRole('button', { name, exact: true }).click();

  const popover = page.getByRole('dialog', { name, exact: true });
  await expect(popover).toBeVisible();

  const scrollRegion = page.getByRole('region', { name: 'Cluster locations' });
  const lastItem = scrollRegion.getByRole('listitem').last();
  await lastItem.scrollIntoViewIfNeeded();
  await expect(popover.getByRole('button', { name: 'Load more', exact: true })).toBeEnabled();

  await page.mouse.move(-10, -10);
  await si.runVisualAndA11yTests('popover', {
    axeRulesSet: [{ id: 'label-content-name-mismatch', enabled: false }],
    skipAriaSnapshot: true
  });
});
