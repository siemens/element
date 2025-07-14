/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { test } from '../../support/test-helpers';

test.describe('si-tree-view', () => {
  const example = 'si-tree-view/si-tree-view-playground';

  test(example + ' base tree', async ({ page, si }) => {
    await si.visitExample(example);

    await page.locator('i.si-tree-view-item-dropdown-caret').first().click();
    await page.locator('.si-tree-view-item-object-data').getByText('Pune').click();

    await si.runVisualAndA11yTests('base-tree');
  });

  test(example + ' base tree with data field 2', async ({ page, si }) => {
    await si.visitExample(example);

    await page.getByLabel('Enable data field 2').check();
    await page.locator('i.si-tree-view-item-dropdown-caret').first().click();
    await page.locator('.si-tree-view-item-object-data').getByText('Pune').click();

    await si.runVisualAndA11yTests('base-tree-with-data-field-2');
  });

  test(example + ' base tree with checkbox', async ({ page, si }) => {
    await si.visitExample(example);

    await page.getByLabel('Enable checkboxes').check();
    await page.locator('i.si-tree-view-item-dropdown-caret').first().click();
    await page.locator('.si-tree-view-item-object-data').getByText('Pune').click();

    await si.runVisualAndA11yTests('base-tree-with-checkbox');
  });

  test(example + ' expand/collapse buttons', async ({ page, si }) => {
    await si.visitExample(example);

    await page.getByLabel('Show expand/collapse all buttons').check();
    await page.locator('i.si-tree-view-item-dropdown-caret').first().click();
    await page.locator('.si-tree-view-item-object-data').getByText('Pune').click();

    await si.runVisualAndA11yTests('expand-collapse');
  });

  test(example + ' flat tree', async ({ page, si }) => {
    await si.visitExample(example);

    await page.getByLabel('Flat tree').check();
    await page.locator('a.si-tree-view-item-toggle').first().click();
    await page.locator('.si-tree-view-item-object-data').getByText('Pune').click();

    await si.runVisualAndA11yTests('flat-tree');
  });

  test(example + '  grouped tree', async ({ page, si }) => {
    await si.visitExample(example);

    await page.getByLabel('Grouped list').check();
    await page.locator('i.si-tree-view-item-icon').first().click();
    await page.locator('.si-tree-view-item-object-data').getByText('Pune').click();

    await si.runVisualAndA11yTests('grouped-tree');
  });
});
