/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { test } from '../../support/test-helpers';

test.describe('application-header', () => {
  const example = 'si-application-header/si-application-header';

  test('on a large screen', async ({ page, si }) => {
    await si.visitExample(example);
    await page.getByRole('button', { name: 'Tenant 1' }).click();
    await page.getByRole('button', { name: 'Tenant 2', exact: true }).click();
    await page.getByText('Module 2').click();
    await si.runVisualAndA11yTests('navigation expanded');
    await page.getByText('Notifications').click();
    await si.runVisualAndA11yTests('notifications expanded');
    await page.getByRole('button', { name: 'Lars Vegas' }).click();
    await page.getByText('Language').click();
    await si.runVisualAndA11yTests('account expanded');
    await page.getByRole('button', { name: 'Lars Vegas' }).click();
    await si.runVisualAndA11yTests();
  });

  test('on a small screen', async ({ page, si }) => {
    await si.visitExample(example);
    await page.setViewportSize({ width: 500, height: 660 });
    await page.getByLabel('Toggle navigation').click();
    await page.getByText('Module 2').click();
    await si.runVisualAndA11yTests('mobile navigation expanded');
    await page.getByText('Notifications').click();
    await si.runVisualAndA11yTests('mobile notifications expanded');
    await page.getByLabel('Toggle actions').click();
    await page.getByText('Support').click();
    await si.runVisualAndA11yTests('mobile collapsible actions expanded');
    await page.getByRole('button', { name: 'Lars Vegas' }).click();
    await page.getByText('Language').click();
    await si.runVisualAndA11yTests('mobile account expanded');
    // might be fully covered, but clicking it should be fine
    await page.locator('.modal-backdrop').click({ force: true });
    await si.runVisualAndA11yTests('mobile');
  });
});
