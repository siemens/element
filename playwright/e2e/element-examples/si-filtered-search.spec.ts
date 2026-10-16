/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { type Locator, type Page } from '@playwright/test';

import { expect, test } from '../../support/test-helpers';

test.describe('filtered search', () => {
  const setupPasteTest = async (
    page: Page,
    si: { visitExample(name: string): Promise<void> },
    narrow = false
  ): Promise<{ search: Locator; freeTextSearch: Locator; dropdown: Locator }> => {
    await si.visitExample('si-filtered-search/si-filtered-search-playground');
    const searchCriteriaInput = page.getByPlaceholder(/Enter and assign search criteria/);
    await searchCriteriaInput.fill('{ "criteria": [], "value": "" }');
    await searchCriteriaInput.blur();
    const search = page.locator('si-filtered-search');
    if (narrow) {
      await search.evaluate(element => (element.style.inlineSize = '300px'));
    }
    const freeTextSearch = search.getByLabel('search', { exact: true }).last();
    const dropdown = page.getByRole('listbox');
    await freeTextSearch.focus();
    await expect(dropdown).toBeVisible();
    return { search, freeTextSearch, dropdown };
  };

  const pasteCriteria = async (page: Page, text: string): Promise<void> => {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.evaluate(value => navigator.clipboard.writeText(value), text);
    await page.keyboard.press('Control+KeyV');
  };

  for (const { count, text, narrow } of [
    { count: 2, text: 'Location:Munich;Name:Alex;', narrow: false },
    { count: 3, text: 'Location:Munich;Name:Alex;Location:Karlsruhe;', narrow: false },
    { count: 3, text: 'Location:Munich;Name:Alex;Location:Karlsruhe;', narrow: true }
  ]) {
    test(`should align the open dropdown after pasting ${count} criteria${narrow ? ' into an overflowing search bar' : ''}`, async ({
      si,
      page
    }) => {
      const { search, freeTextSearch, dropdown } = await setupPasteTest(page, si, narrow);

      await pasteCriteria(page, text);

      await expect(search.locator('si-filtered-search-value')).toHaveCount(count);
      await expect(freeTextSearch).toBeFocused();
      await expect(freeTextSearch).toHaveValue('');
      await expect(dropdown).toBeVisible();
      await si.runVisualAndA11yTests(`pasted-${count}-criteria${narrow ? '-overflow' : ''}`);
    });
  }

  test('should align the value dropdown of the final unterminated pasted criterion', async ({
    si,
    page
  }) => {
    const { search, freeTextSearch, dropdown } = await setupPasteTest(page, si);

    await pasteCriteria(page, 'Country:Germany;Name:Alex;Location:Munich');

    await expect(search.locator('si-filtered-search-value')).toHaveCount(3);
    const valueInput = search.locator('.pill-group', { hasText: 'Location' }).getByRole('combobox');
    await expect(valueInput).toBeFocused();
    await expect(valueInput).toHaveValue('Munich');
    await expect(freeTextSearch).not.toBeFocused();
    await expect(dropdown.getByRole('option', { name: 'Munich', exact: true })).toBeVisible();
    await si.runVisualAndA11yTests('pasted-final-criterion-editing');
  });

  test('should create remove criteria', async ({ si, page }) => {
    test.slow(
      true,
      'Six visual/accessibility checkpoints exceeded 30 seconds during snapshot generation at the final empty checkpoint.'
    );
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
    // There are currently two combox with the label "search". The input of the pill and the free text search.
    // TODO: pill and free text should have different labels.
    await expect(
      page.locator('.pill-group').getByRole('combobox', { name: 'search' })
    ).toHaveAttribute('aria-expanded', 'true');
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
    await expect(page.getByRole('option').first()).not.toBeVisible(); // Ensures that the view was updated by Angular after typing.
    await expect(
      page.locator('.pill-group', { hasText: 'Location' }).getByRole('combobox')
    ).toHaveValue('Hannover');
    await page.keyboard.press('Enter');
    await expect(freeTextSearch).toBeFocused();
    await freeTextSearch.fill('Building:House');
    await page.keyboard.press('Enter');
    await page.getByLabel('Only predefined criteria').check();
    await page.getByLabel('Only predefined criterion options', { exact: true }).check();
    await si.runVisualAndA11yTests('invalid-criterion');
  });

  test('should show focus ring on empty criterion value', async ({ si, page }) => {
    await si.visitExample('si-filtered-search/si-filtered-search-playground');
    const searchCriteriaInput = page.getByPlaceholder(/Enter and assign search criteria/);
    await searchCriteriaInput.fill(
      '{ "criteria": [{"name":"location", "value":""}], "value": "" }'
    );
    await searchCriteriaInput.blur();
    const criterionValue = page.locator('.criterion-value-text');
    await criterionValue.focus();
    await si.runVisualAndA11yTests('empty-value-focused');
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
