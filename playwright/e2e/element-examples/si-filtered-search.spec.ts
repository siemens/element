/**
 * Copyright (c) Siemens 2016 - 2026
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
    // Wait for focus to settle on the free text input before triggering backspace,
    // otherwise the subsequent focus into the Location pill can race the focus restore.
    await expect(freeTextSearch).toBeFocused();
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
    const locationCombobox = page
      .locator('.pill-group', { hasText: 'Location' })
      .getByRole('combobox');
    await expect(locationCombobox).toBeFocused();
    // Wait for the typeahead input to be populated with the existing value before
    // replacing it, otherwise Control+A can fire before the value is written to
    // the DOM and the subsequent typing gets appended instead of replacing it.
    await expect(locationCombobox).toHaveValue('Munich');
    // Replace the existing value instead of relying on Control+A + type, which
    // is racy when the typeahead overlay is in the middle of opening.
    await locationCombobox.fill('H');
    await expect(page.getByRole('option', { name: 'Karlsruhe' })).toHaveClass(/active/);
    // Use fill instead of keyboard.type, which is flaky here because the
    // typeahead overlay re-renders between keystrokes and can drop characters.
    await locationCombobox.fill('Hannover');
    await expect(page.getByRole('option').first()).not.toBeVisible(); // Ensures that the view was updated by Angular after typing.
    await page.keyboard.press('Enter');
    await expect(freeTextSearch).toBeFocused();
    await freeTextSearch.fill('Building:House');
    await page.keyboard.press('Enter');
    await page.getByLabel('Only predefined criteria').check();
    await page.getByLabel('Only predefined criterion options', { exact: true }).check();
    // Wait for the invalid styling to be applied before taking the screenshot,
    // and move the mouse out of the viewport so the lingering hover state on the
    // last clicked checkbox does not affect the visual snapshot.
    await expect(page.locator('.pill-group.invalid-criterion').first()).toBeVisible();
    await page.mouse.move(-10, -10);
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
