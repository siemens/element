/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-select', () => {
  const example = 'si-select/si-select';
  const lazyLoadExample = 'si-select/si-select-lazy-load';

  test(example, async ({ page, si }) => {
    await si.visitExample(example);

    await page.getByRole('combobox', { name: 'FormControl' }).click();
    await si.runVisualAndA11yTests('form-select');
    await page.locator('.cdk-overlay-backdrop').click({ position: { x: 0, y: 0 }, force: true });

    await page.getByRole('combobox', { name: 'Multi select' }).click();
    await si.runVisualAndA11yTests('multi-select');
    await page.locator('.cdk-overlay-backdrop').click({ position: { x: 0, y: 0 }, force: true });

    await page.getByRole('combobox', { name: 'Multi-select with groups' }).click();
    await si.runVisualAndA11yTests('multi-select-with-groups');
    await page.locator('.cdk-overlay-backdrop').click({ position: { x: 0, y: 0 }, force: true });

    await page.getByRole('combobox', { name: 'Select with custom template' }).click();
    await si.runVisualAndA11yTests('custom-template');
    await page.locator('.cdk-overlay-backdrop').click({ position: { x: 0, y: 0 }, force: true });

    await page.getByRole('combobox', { name: 'Select with actions' }).click();
    await si.runVisualAndA11yTests('actions');
    await page.getByRole('button', { name: 'clear' }).click();
    await page.locator('.cdk-overlay-backdrop').click({ position: { x: 0, y: 0 }, force: true });

    await page.locator('h4').first().click();

    await page.getByRole('checkbox', { name: 'Readonly' }).check();
    await si.runVisualAndA11yTests('readonly');

    await page.getByRole('checkbox', { name: 'Readonly' }).uncheck();
    await page.getByRole('checkbox', { name: 'Disabled' }).check();
    await si.runVisualAndA11yTests('disabled');
  });

  test(example + ' with filter', async ({ page, si }) => {
    await si.visitExample(example);

    await page.getByRole('checkbox', { name: 'With filter' }).check();
    // When filters are enabled, the dropdown content is also a combobox. So we must make sure to select real outer combobox.
    const formControlSelect = page.getByRole('combobox', { name: 'FormControl' }).first();
    await formControlSelect.click();

    const selectFormControlInput = page.getByRole('combobox', { name: 'FormControl' }).nth(1);
    await expect(selectFormControlInput).toBeFocused();
    await expect(selectFormControlInput).toHaveAttribute('aria-expanded', 'true');
    await expect(formControlSelect.first()).toContainClass('active');

    await si.runVisualAndA11yTests('filter-opened');
    await selectFormControlInput.pressSequentially('Bad');
    await expect(page.getByRole('option')).toHaveText(['Bad', 'Very bad']);
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('option', { name: 'Bad', exact: true })).toContainClass('active');
    await si.runVisualAndA11yTests('filter-searched');
    await page.keyboard.press('Enter');
    await expect(formControlSelect).not.toHaveAttribute('aria-expanded', 'true');
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
    await expect(page.getByRole('button', { name: 'New optio' })).toBeVisible();
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
