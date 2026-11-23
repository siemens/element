/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('launchpad', () => {
  const example = 'si-application-header/si-launchpad';

  test('on a large screen', async ({ page, si }) => {
    await si.visitExample(example);
    await page.getByLabel('Launchpad').click();
    await page.getByText('Show more').click();
    await si.runVisualAndA11yTests();

    await page.getByRole('link', { name: 'Fischbach' }).first().locator('.favorite-icon').click();
    await si.runVisualAndA11yTests('new favorite');
  });

  test('on a small screen', async ({ page, si }) => {
    await si.visitExample(example);
    await page.setViewportSize({ width: 500, height: 660 });
    await page.getByLabel('Launchpad').click();
    await page.getByText('Show more').click();
    await si.runVisualAndA11yTests('mobile');
  });

  test('shows truncated app labels on keyboard focus', async ({ page, si }) => {
    await si.visitExample(example);
    await page.getByLabel('Launchpad').press('Enter');
    await page.getByRole('button', { name: 'Show more' }).press('Enter');
    await page
      .getByRole('link', { name: /This is a really long name/ })
      .first()
      .focus();
    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText('This is a really long name');
    await expect(tooltip).toContainText('System name');
  });

  for (const mobile of [false, true]) {
    test(`with wrapped app labels on ${mobile ? 'a small' : 'a large'} screen`, async ({
      page,
      si
    }) => {
      await si.visitExample(example);
      if (mobile) {
        await page.setViewportSize({ width: 320, height: 660 });
      }
      await page.getByRole('checkbox', { name: 'Wrap app labels' }).check();
      await page.getByRole('button', { name: 'Launchpad', exact: true }).click();
      await page.getByRole('button', { name: 'Show more' }).click();

      const longLabel = page.getByRole('link', { name: /This is a really long name/ }).first();
      const shortLabel = page.getByRole('link', { name: 'Assets System name' }).last();
      await expect(longLabel).toBeVisible();
      const longTile = await longLabel.boundingBox();
      const shortTile = await shortLabel.boundingBox();
      expect(longTile!.height).toBeCloseTo(shortTile!.height);
    });
  }
});
