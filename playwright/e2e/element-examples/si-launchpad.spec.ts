/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('launchpad', () => {
  const example = 'si-application-header/si-launchpad';

  test('on a large screen', async ({ page, si }) => {
    await si.visitExample(example);
    await page.getByLabel('Launchpad').press('Enter');
    await page.getByRole('link', { name: 'Statistics and performance analytics' }).first().focus();
    await expect(page.getByRole('tooltip')).toContainText('Statistics and performance analytics');
    await expect(page.getByRole('tooltip')).toContainText(
      'Building automation and monitoring system'
    );
    await si.runVisualAndA11yTests('focused tooltip');

    await page.getByText('More').click();
    await si.runVisualAndA11yTests();

    await page.getByRole('link', { name: 'Fischbach' }).last().locator('.favorite-icon').click();
    await si.runVisualAndA11yTests('new favorite');
  });

  test('on a small screen', async ({ page, si }) => {
    await si.visitExample(example);
    await page.setViewportSize({ width: 500, height: 660 });
    await page.getByLabel('Launchpad').click();
    await page.getByText('More').click();
    await si.runVisualAndA11yTests('mobile');
  });
});
