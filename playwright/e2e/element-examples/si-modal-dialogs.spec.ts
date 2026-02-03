/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-modal-dialogs', () => {
  const example = 'si-modals/si-modal-dialogs';

  test.afterEach(async ({ page }) => {
    await page
      .locator('[aria-label="OK"]')
      .or(page.locator('[aria-label="No"]'))
      .or(page.locator('[aria-label="Cancel"]'))
      .click();
  });

  test(example + ' alert', async ({ page, si }) => {
    await si.visitExample(example);

    await page.locator('.btn').getByText('Default alert').click();
    await expect(page.locator('.modal-body')).toBeVisible();

    await si.runVisualAndA11yTests('alert');
  });

  test(example + ' confirmation', async ({ page, si }) => {
    await si.visitExample(example);

    await page.locator('.btn').getByText('Yes/No confirmation').click();
    await expect(page.locator('.modal-body')).toBeVisible();

    await si.runVisualAndA11yTests('confirmation');
  });

  test(example + ' edit-discard', async ({ page, si }) => {
    await si.visitExample(example);

    await page.locator('.btn').getByText('Edit-Discard with save', { exact: true }).click();
    await expect(page.locator('.modal-body')).toBeVisible();

    await si.runVisualAndA11yTests('edit-discard');
  });

  test(example + ' delete-confirmation', async ({ page, si }) => {
    await si.visitExample(example);

    await page.locator('.btn').getByText('Delete confirmation', { exact: true }).click();
    await expect(page.locator('.modal-body')).toBeVisible();

    await si.runVisualAndA11yTests('delete-confirmation');
  });

  test(example + ' many columns', async ({ page, si }) => {
    await si.visitExample(example);

    await page.getByText('Many columns').first().click();
    // Ensure everything is in place for the mouse interactions.
    await expect(page.locator('.modal-body')).toHaveBoundingBox({ x: 274, y: 116 });

    await page.getByRole('option', { name: 'Row 5' }).locator('.cdk-drag-handle').hover();
    await page.mouse.down();
    await page.mouse.move(700, 510, { steps: 5 });
    // Ensure it is at the correct place before taking the screenshot.
    await expect(page.locator('.cdk-drag-preview')).toHaveBoundingBox({ x: 273, y: 484 });
    await si.runVisualAndA11yTests('dragging', {
      // Those rules are triggered because of the draggable element.
      axeRulesSet: [
        { id: 'aria-input-field-name', enabled: false },
        { id: 'aria-required-parent', enabled: false },
        { id: 'aria-toggle-field-name', enabled: false }
      ]
    });
    await page.mouse.up();

    await page.getByRole('option', { name: 'Row 8' }).press('Enter');
    await expect(page.getByRole('textbox', { name: 'Rename column' })).toBeFocused();
    await page.keyboard.type(' M');
    await page.getByRole('option', { name: 'Row 8' }).press('Enter');
    await page.getByRole('option', { name: 'Row 8' }).press('Space');

    await si.runVisualAndA11yTests('columns-many');
  });
});
