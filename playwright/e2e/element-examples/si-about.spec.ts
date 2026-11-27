/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-about', () => {
  test('expanded license file content', async ({ page, si }) => {
    await si.visitExample('si-about/si-about-api');

    const licenseCategory = page.locator('.license-api').first();
    await licenseCategory.getByRole('button').first().click();
    await expect(licenseCategory.locator('.license-api-file').first()).toBeVisible();

    const licenseFile = licenseCategory.locator('.license-api-file').first();
    await licenseFile.getByRole('button').click();
    await expect(licenseFile.locator('.license-api-file-content')).toBeVisible();

    await si.runVisualAndA11yTests();
  });

  test.describe('api states', () => {
    const example = 'si-about/si-about-api-states';

    test.beforeEach(async ({ page, si }) => {
      await si.visitExample(example);
      await expect(page.getByRole('button', { name: 'OS' })).toBeVisible();

      const delaySlider = page.getByLabel('Response delay');
      await delaySlider.press('Home');
      await expect(page.getByText('Response delay: 0 ms')).toBeVisible();
    });

    test('license index loading, error, and empty states', async ({ page, si }) => {
      const indexSelect = page.getByLabel('License index');
      const licenseSection = page.locator('.license-api-section');

      await indexSelect.selectOption('loading');
      await expect(licenseSection).toHaveAttribute('aria-busy', 'true');
      await expect(page.getByRole('status')).toHaveText('Loading licenses…');
      await expect(licenseSection.locator('.si-skeleton').first()).toBeVisible();
      await page.mouse.move(-10, -10);
      await si.runVisualAndA11yTests('index-loading');

      await indexSelect.selectOption('error');
      await expect(page.getByRole('alert')).toHaveText('Could not load licenses.');
      await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
      await page.mouse.move(-10, -10);
      await si.runVisualAndA11yTests('index-error');

      await indexSelect.selectOption('empty');
      await expect(licenseSection.getByText('No licenses available.')).toBeVisible();
      await expect(page.getByRole('status')).toHaveText('No licenses available.');
      await page.mouse.move(-10, -10);
      await si.runVisualAndA11yTests('index-empty');
    });

    test('component list and license text states', async ({ page, si }) => {
      const categorySelect = page.getByLabel('Component lists');
      const textSelect = page.getByLabel('License texts');
      const licenseSection = page.locator('.license-api-section');

      await categorySelect.selectOption('loading');
      await page.getByRole('button', { name: 'OS' }).click();
      await expect(
        page.locator('.license-api').first().locator('.license-api-panel-content')
      ).toHaveAttribute('aria-busy', 'true');
      await expect(page.getByRole('status')).toHaveText('Loading licenses…');
      await expect(
        page.locator('.license-api').first().locator('.si-skeleton').first()
      ).toBeVisible();

      await categorySelect.selectOption('error');
      await page.getByRole('button', { name: 'Application' }).click();
      await expect(page.getByRole('alert')).toHaveText('Could not load licenses.');
      await page.mouse.move(-10, -10);
      await si.runVisualAndA11yTests('category-states');

      await categorySelect.selectOption('loaded');
      await page.getByRole('button', { name: 'Reload' }).click();
      await expect(page.getByRole('button', { name: 'OS' })).toBeVisible();

      await page.getByRole('button', { name: 'OS' }).click();
      await expect(page.getByRole('button', { name: 'Example Lib Three 2.0.3' })).toBeVisible();

      await textSelect.selectOption('loading');
      await page.getByRole('button', { name: 'Example Lib Three 2.0.3' }).click();
      await expect(page.getByRole('status')).toHaveText('Loading license text…');
      await expect(
        page.locator('.license-api-file').first().locator('.si-skeleton').first()
      ).toBeVisible();

      await textSelect.selectOption('error');
      await page.getByRole('button', { name: 'Example Lib Four 1.3.7' }).click();
      await expect(page.getByRole('alert')).toHaveText('Could not load license text.');

      await page.getByRole('button', { name: 'Application' }).click();
      await expect(page.getByRole('button', { name: 'Example Lib One 1.0.0' })).toBeVisible();

      await textSelect.selectOption('empty');
      await page.getByRole('button', { name: 'Example Lib One 1.0.0' }).click();
      await expect(licenseSection.getByText('No license text available.')).toBeVisible();
      await expect(page.getByRole('status')).toHaveText('No license text available.');

      await page.mouse.move(-10, -10);
      await si.runVisualAndA11yTests('file-states');
    });
  });
});
