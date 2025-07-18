/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { test } from '../../support/test-helpers';

test.describe('launchpad', () => {
  const example = 'si-application-header/si-launchpad';

  test('on a large screen', async ({ page, si }) => {
    await si.visitExample(example);
    await page.getByLabel('Launchpad').click();
    await page.getByText('Show more').click();
    await si.runVisualAndA11yTests();

    await page.getByRole('link', { name: 'Rocket' }).locator('.favorite-icon').click();
    await si.runVisualAndA11yTests('new favorite');
  });

  test('on a small screen', async ({ page, si }) => {
    await si.visitExample(example);
    await page.setViewportSize({ width: 500, height: 660 });
    await page.getByLabel('Launchpad').click();
    await page.getByText('Show more').click();
    await si.runVisualAndA11yTests('mobile');
  });
});
