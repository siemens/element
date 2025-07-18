/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import type { Page } from '@playwright/test';

import { expect, test } from '../../support/test-helpers';

test.describe('dashboard', () => {
  const example = 'dashboard';
  const customCatalog = 'custom-catalog';

  test(example, async ({ page, si }) => {
    await si.visitExample(example, undefined);
    await expect(page.getByRole('heading', { name: 'Sample Dashboard' })).toBeVisible();
    await si.runVisualAndA11yTests('normal');
  });

  test(example + ' tablet', async ({ page, si }) => {
    await page.setViewportSize({ width: 768, height: 1500 });
    await si.visitExample(example, false);
    await expect(page.getByRole('heading', { name: 'Sample Dashboard' })).toBeVisible();
    await si.runVisualAndA11yTests('tablet');
  });

  test(example + ' mobile', async ({ page, si }) => {
    await page.setViewportSize({ width: 375, height: 1500 });
    await si.visitExample(example, false);
    await expect(page.getByRole('heading', { name: 'Sample Dashboard' })).toBeVisible();
    await si.runVisualAndA11yTests('mobile');
  });

  test(example + 'edit', async ({ page, si }) => {
    await si.visitExample(example, undefined);
    await openWidgetCatalog(page);
    await expect(page.getByText('Hello World')).toBeVisible();
    await si.runVisualAndA11yTests('edit');
  });

  test(example + 'empty', async ({ page, si }) => {
    await si.visitExample(example, undefined);
    await openWidgetCatalog(page);
    const search = page.getByPlaceholder('Search widget');
    await expect(search).toBeVisible();
    await search.fill('empty');
    await expect(page.getByText('No widgets available.')).toBeVisible();
    await si.runVisualAndA11yTests('empty');
  });

  test(example + 'helloWorld', async ({ page, si }) => {
    await si.visitExample(example, undefined);
    await openWidgetCatalog(page);

    const helloWorld = page.locator('button', {
      hasText: 'Hello World'
    });
    helloWorld.click();
    const next = page.getByText('Next', {
      exact: true
    });
    next.click();
    await page.waitForTimeout(1000); // Wait for 1 second to allow the page to stabilize

    const title = page.getByRole('textbox', { name: 'Title' });
    const addBtn = page.getByText('Add', {
      exact: true
    });
    await expect(addBtn).not.toBeDisabled();
    await title.fill('');
    await expect(addBtn).toBeDisabled();

    await title.fill('Dashboard World');
    await si.runVisualAndA11yTests('hello-world-editor');
    addBtn.click();

    await page.waitForTimeout(1000);
    await expect(page.getByText('Dashboard World', { exact: true })).toBeVisible();

    page.getByText('Dashboard World', { exact: true }).scrollIntoViewIfNeeded();

    await si.runVisualAndA11yTests('hello-world');
  });

  test(example + 'editor wizard', async ({ page, si }) => {
    await si.visitExample(example, undefined);
    await openWidgetCatalog(page);

    const contact = page.locator('button', {
      hasText: 'Add a contact card to your dashboard.'
    });

    await expect(contact).toBeVisible();
    await expect(contact).not.toHaveClass(/active/);

    contact.click();
    await expect(contact).toHaveClass(/active/);

    const next = page.getByText('Next', {
      exact: true
    });
    next.click();
    await page.waitForTimeout(1000); // Wait for 1 second to allow the page to stabilize

    const nextStepBtn = page.getByText('Next', {
      exact: true
    });
    await expect(nextStepBtn).toBeVisible();
    await expect(nextStepBtn).toBeDisabled();
    await si.runVisualAndA11yTests('contact-editor-step-1');

    const firstName = page.getByRole('textbox', { name: 'First Name' });
    const lastName = page.getByRole('textbox', { name: 'Last Name' });
    await firstName.focus();
    await firstName.fill('Lorem Ipsum');
    await lastName.focus();
    await lastName.fill('Dolor Sit');
    await lastName.press('Tab');
    await expect(nextStepBtn).not.toBeDisabled();
    nextStepBtn.click();
    await expect(page.getByText('Company Information')).toBeVisible();

    const addBtn = page.getByText('Add', {
      exact: true
    });

    await expect(addBtn).toBeDisabled();

    await si.runVisualAndA11yTests('contact-editor-step-2');
    const jobTitle = page.getByRole('textbox', { name: 'Job title' });
    jobTitle.fill('Software Engineer');

    await expect(addBtn).not.toBeDisabled();
    addBtn.click();

    page
      .locator('si-widget-host', {
        hasText: 'Lorem Ipsum Dolor Sit'
      })
      .scrollIntoViewIfNeeded();

    await si.runVisualAndA11yTests('contact-widget');
  });

  test(example + 'delete', async ({ page, si }) => {
    await si.visitExample(example, undefined);
    await expect(page.getByLabel('Edit')).toBeVisible();
    const editBtn = page.getByLabel('Edit');
    editBtn.click();
    const pieChart = page.getByText('Pie Chart', { exact: true }).locator('..');
    pieChart.getByTitle('Remove').click();
    await page.waitForTimeout(100);
    await expect(page.locator('si-delete-confirmation-dialog')).toBeVisible();
    await si.runVisualAndA11yTests('delete-confirmation-dialog');

    const deleteBtn = page.locator('si-delete-confirmation-dialog').getByText('Remove', {
      exact: true
    });
    deleteBtn.click();
    await expect(page.getByText('Pie Chart', { exact: true })).not.toBeVisible();

    await si.runVisualAndA11yTests('delete');
  });

  test(customCatalog, async ({ page, si }) => {
    await si.visitExample(customCatalog, undefined);
    await expect(page.getByText('Your own dashboard')).toBeVisible();
    await si.runVisualAndA11yTests('custom-catalog');
  });

  const openWidgetCatalog = async (page: Page): Promise<void> => {
    await expect(page.getByLabel('Edit')).toBeVisible();
    const editBtn = page.getByLabel('Edit');
    editBtn.click();
    await expect(page.getByText('Add widget')).toBeVisible();
    const addWidgetBtn = page.getByText('Add widget');
    addWidgetBtn.click();
  };
});
