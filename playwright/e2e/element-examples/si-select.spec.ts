/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-select', () => {
  const example = 'si-select/si-select';
  const lazyLoadExample = 'si-select/si-select-lazy-load';

  test(example, async ({ page, si }) => {
    await si.visitExample(example);

    await page.locator('si-select').nth(1).click();
    await si.runVisualAndA11yTests('form-select');
    await page.locator('.cdk-overlay-backdrop').click({ position: { x: 0, y: 0 }, force: true });

    await page.locator('si-select').nth(2).click();
    await si.runVisualAndA11yTests('multi-select');
    await page.locator('.cdk-overlay-backdrop').click({ position: { x: 0, y: 0 }, force: true });

    await page.locator('si-select').nth(3).click();
    await si.runVisualAndA11yTests('multi-select-with-groups');
    await page.locator('.cdk-overlay-backdrop').click({ position: { x: 0, y: 0 }, force: true });

    await page.locator('si-select').nth(4).click();
    await si.runVisualAndA11yTests('custom-template');
    await page.locator('.cdk-overlay-backdrop').click({ position: { x: 0, y: 0 }, force: true });

    await page.locator('si-select').nth(5).click();
    await si.runVisualAndA11yTests('actions');
    await page.locator('[aria-label="clear"]').click();
    await page.locator('.cdk-overlay-backdrop').click({ position: { x: 0, y: 0 }, force: true });

    await page.locator('h4').first().click();

    await page.locator('.form-check-inline').first().click();
    await si.runVisualAndA11yTests('readonly');

    await page.locator('.form-check-inline').first().click();
    await page.locator('.form-check-inline').nth(1).click();
    await si.runVisualAndA11yTests('disabled');
  });

  test(example + ' with filter', async ({ page, si }) => {
    await si.visitExample(example);

    await page.getByRole('checkbox', { name: 'With filter' }).check();
    const formControlSelect = page.getByRole('combobox', { name: 'FormControl' });
    await formControlSelect.click();

    const selectFormControlInput = page.getByRole('combobox', { name: 'FormControl' }).nth(1);
    await expect(selectFormControlInput).toBeFocused();
    await expect(selectFormControlInput).toHaveAttribute('aria-expanded', 'true');
    await expect(formControlSelect.first()).toContainClass('active');

    await si.runVisualAndA11yTests('filter-opened');
    await selectFormControlInput.pressSequentially('Bad');
    await page.keyboard.press('ArrowDown');
    await si.runVisualAndA11yTests('filter-searched');
    await page.keyboard.press('Enter');
    await si.runVisualAndA11yTests('filter-selected');

    await formControlSelect.click();
    await expect(selectFormControlInput).toBeFocused();
    await expect(selectFormControlInput).toHaveAttribute('aria-expanded', 'true');
    await expect(formControlSelect.first()).toContainClass('active');

    await selectFormControlInput.pressSequentially('no-value-found');
    await si.runVisualAndA11yTests('filter-no-value-found');
    await page.locator('.cdk-overlay-backdrop').click({ position: { x: 0, y: 0 }, force: true });

    const selectWithActions = page.getByRole('combobox', { name: 'Select with actions' });
    await selectWithActions.click();

    const selectInputWithActions = page
      .getByRole('combobox', { name: 'Select with actions' })
      .nth(1);
    await expect(selectInputWithActions).toBeFocused();
    await expect(selectInputWithActions).toHaveAttribute('aria-expanded', 'true');
    await expect(selectWithActions.first()).toContainClass('active');

    await selectInputWithActions.pressSequentially('New option');
    await si.runVisualAndA11yTests('actions-search');
    await page.getByRole('button', { name: 'create' }).click();
    await selectInputWithActions.focus();
    await page.keyboard.press('Backspace');
    await si.runVisualAndA11yTests('actions-option-created');
  });

  test(lazyLoadExample, async ({ page, si }) => {
    await si.visitExample(lazyLoadExample);
    const select = page.getByLabel('Lazy options');
    await expect(select).toContainText('DE - Germany');
    await select.click();
    await page.getByPlaceholder('Search...').fill('sw');
    await expect(page.getByText('Switzerland')).toBeVisible();
    await si.runVisualAndA11yTests();
    await page.getByText('Switzerland').click();
    await si.runVisualAndA11yTests('checked');
  });
});
