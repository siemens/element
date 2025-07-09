/**
 * Copyright Siemens 2016 - 2025.
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

    await page.locator('.btn').getByText('Default Alert').click();
    await expect(page.locator('.modal-body')).toBeVisible();

    await si.runVisualAndA11yTests('alert');
  });

  test(example + ' confirmation', async ({ page, si }) => {
    await si.visitExample(example);

    await page.locator('.btn').getByText('Confirmation 1').click();
    await expect(page.locator('.modal-body')).toBeVisible();

    await si.runVisualAndA11yTests('confirmation');
  });

  test(example + ' edit-discard', async ({ page, si }) => {
    await si.visitExample(example);

    await page.locator('.btn').getByText('Edit-Discard').first().click();
    await expect(page.locator('.modal-body')).toBeVisible();

    await si.runVisualAndA11yTests('edit-discard');
  });

  test(example + ' delete-confirmation', async ({ page, si }) => {
    await si.visitExample(example);

    await page.locator('.btn').getByText('Delete Confirmation').click();
    await expect(page.locator('.modal-body')).toBeVisible();

    await si.runVisualAndA11yTests('delete-confirmation');
  });

  test(example + ' many columns', async ({ page, si }) => {
    await si.visitExample(example);

    await page.getByText('Many columns').first().click();
    await expect(page.locator('.modal-body')).toBeVisible();

    await page.getByRole('option', { name: 'Row 5' }).locator('.cdk-drag-handle').hover();
    await page.mouse.down();
    // PW is sometimes faster than Angular. So we need to make sure events arrive.
    await page.mouse.move(600, 280, { steps: 5 }); // CDK will only create a preview if the element is actually moved.
    await expect(page.locator('.cdk-drag-preview')).toBeVisible(); // We need to wait for the CDK creating the element.
    await page.mouse.move(700, 380, { steps: 5 }); // After the element is created, we can move it the actual position.
    // Those rules are triggered because of the draggable element.
    // This is not relevant, as only no-sr user will drag elements.
    await si.runVisualAndA11yTests('dragging', {
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
