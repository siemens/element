/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { test } from '../../support/test-helpers';

test.describe('navbar launchpad', () => {
  const example = 'si-navbar/si-navbar-primary';
  const exampleEnd = 'si-navbar/si-navbar-primary-end';

  test(example + ' on a normal screen', async ({ page, si }) => {
    await si.visitExample(example);

    await page.getByText('item 2', { exact: true }).click();
    await page.waitForTimeout(400); // wait for expand-icon animation
    await si.runVisualAndA11yTests('normal-expanded');
  });

  test(example + ' on a small screen', async ({ page, si }) => {
    await page.setViewportSize({ width: 500, height: 660 });
    await si.visitExample(example, false);

    await page.getByLabel('Toggle navigation').click();
    await page.getByText('item 2', { exact: true }).click();
    await si.runVisualAndA11yTests('small-expanded');
  });

  test(exampleEnd + ' with account on a normal screen', async ({ page, si }) => {
    await si.visitExample(exampleEnd);

    await page.getByRole('button', { name: 'Jane Smith' }).click();
    await page.getByText('Company').click();
    await page.waitForTimeout(400); // wait for expand-icon animation
    await si.runVisualAndA11yTests('normal-expanded');
  });

  test(exampleEnd + ' on a small screen', async ({ page, si }) => {
    await page.setViewportSize({ width: 500, height: 660 });
    await si.visitExample(exampleEnd, false);

    await page.getByLabel('Toggle actions').click();
    await page.getByRole('button', { name: 'Help' }).click();
    await page.waitForTimeout(400); // wait for expand-icon animation
    await si.runVisualAndA11yTests('small-expanded');
  });
});
