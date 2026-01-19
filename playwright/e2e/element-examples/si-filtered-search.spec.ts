/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('filtered search', () => {
  test('should create remove criteria', async ({ si, page }) => {
    await page.clock.setFixedTime('2022-02-20');
    await si.visitExample('si-filtered-search/si-filtered-search-playground');
    // FS lacks a11y features. One of the problems is that all inputs are labeled as search. The last one will always be the free text search.
    const freeTextSearch = page.getByLabel('search', { exact: true }).last();
    await freeTextSearch.focus();
    await page.keyboard.type('Event');
    await page.getByLabel('Event', { exact: true }).click();
    await si.runVisualAndA11yTests('operator-open');
    await page.getByLabel('=').click();
    await si.runVisualAndA11yTests('datepicker-open');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Score');
    await page.getByLabel('Score').click();
    await si.runVisualAndA11yTests('multi-select-open');
    await page.getByLabel('Good').click();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(freeTextSearch).toBeFocused();
    await si.runVisualAndA11yTests('data-entered');
    // remove score criterion
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(page.locator('.criterion-value-text', { hasText: 'Good' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(
      page.locator('.pill-group', { hasText: 'Score' }).getByRole('combobox')
    ).toBeFocused();
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Escape');
    await expect(page.getByText('Score')).not.toBeAttached();
    // remove event criterion
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Escape');
    await expect(page.getByText('Event', { exact: true })).not.toBeAttached();
    // delete location criterion
    await page.keyboard.press('Backspace');
    await expect(
      page.locator('.pill-group', { hasText: 'Location' }).getByRole('combobox')
    ).toBeFocused();
    await page.keyboard.press('Control+KeyA');
    await page.keyboard.press('Backspace');
    await si.runVisualAndA11yTests('typeahead-open');
    await page.keyboard.press('Backspace');
    await si.runVisualAndA11yTests('empty');
  });

  test('should highlight invalid criterion and criterion values', async ({ si, page }) => {
    await si.visitExample('si-filtered-search/si-filtered-search-playground');
    // FS lacks a11y features. One of the problems is that all inputs are labeled as search. The last one will always be the free text search.
    const freeTextSearch = page.getByLabel('search', { exact: true }).last();
    await freeTextSearch.focus();
    await page.keyboard.press('Backspace');
    await expect(
      page.locator('.pill-group', { hasText: 'Location' }).getByRole('combobox')
    ).toBeFocused();
    await page.keyboard.press('Control+KeyA');
    await page.keyboard.type('H');
    await expect(page.getByRole('option', { name: 'Karlsruhe' })).toHaveClass(/active/);
    await page.keyboard.type('annover');
    await page.keyboard.press('Enter');
    await expect(freeTextSearch).toBeFocused();
    await freeTextSearch.fill('Building:House');
    await page.keyboard.press('Enter');
    await page.getByLabel('Only predefined criteria').check();
    await page.getByLabel('Only predefined criterion options', { exact: true }).check();
    await si.runVisualAndA11yTests('invalid-criterion');
  });

  test('should not be interactive when disabled', async ({ si, page }) => {
    await si.visitExample('si-filtered-search/si-filtered-search-playground');
    await page.getByLabel('Disabled').check();
    await si.runVisualAndA11yTests();
  });

  test('should create free text pill', async ({ si, page }) => {
    await si.visitExample('si-filtered-search/si-filtered-search-playground');
    await page.getByRole('checkbox', { name: 'Disable free text pills' }).setChecked(false);
    // FS lacks a11y features. One of the problems is that all inputs are labeled as search. The last one will always be the free text search.
    const freeTextSearch = page.getByLabel('search', { exact: true }).last();
    await freeTextSearch.focus();
    await page.keyboard.type('my free text');
    await expect(page.getByRole('option', { name: /Search for/ })).toBeInViewport();
    await si.runVisualAndA11yTests('freetext-typeahead-open');
    // Select the "Search for" item
    await page.getByRole('option', { name: /Search for/ }).click();
    await si.runVisualAndA11yTests('freetext-selected');

    // Edit the created free text pill
    const freeTextPill = page.getByText('my free text', { exact: true });
    await expect(freeTextPill).toBeVisible();
    await freeTextPill.click();
    // Wait for edit mode to activate - the input should appear and be focused
    await expect(page.getByLabel('search', { exact: true }).first()).toBeFocused();
    await si.runVisualAndA11yTests('freetext-edit-mode');
    // Clear and type new value
    await page.keyboard.press('Control+KeyA');
    await page.keyboard.type('updated free text');
    await page.keyboard.press('Enter');
    // Verify the value was updated
    await expect(page.getByText('updated free text', { exact: true })).toBeVisible();
    await si.runVisualAndA11yTests('freetext-updated');
  });
});
