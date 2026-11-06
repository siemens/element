/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-tree-view', () => {
  const example = 'si-tree-view/si-tree-view-playground';

  test(example + ' base tree', async ({ page, si }) => {
    await si.visitExample(example);

    await page
      .locator('a.si-tree-view-item-toggle si-icon[data-icon="itemCollapsedLeft"]')
      .first()
      .click();
    await page.locator('.si-tree-view-item-object-data').getByText('Pune').click();

    await si.runVisualAndA11yTests('base-tree');
  });

  test(example + ' base tree with data field 2', async ({ page, si }) => {
    await si.visitExample(example);

    await page.getByLabel('Enable data field 2').check();
    await page
      .locator('a.si-tree-view-item-toggle si-icon[data-icon="itemCollapsedLeft"]')
      .first()
      .click();
    await page.locator('.si-tree-view-item-object-data').getByText('Pune').click();

    await si.runVisualAndA11yTests('base-tree-with-data-field-2');
  });

  test(example + ' base tree with checkbox', async ({ page, si }) => {
    await si.visitExample(example);

    await page.getByLabel('Enable checkboxes').check();
    await page
      .locator('a.si-tree-view-item-toggle si-icon[data-icon="itemCollapsedLeft"]')
      .first()
      .click();
    await page.locator('.si-tree-view-item-object-data').getByText('Pune').click();

    await si.runVisualAndA11yTests('base-tree-with-checkbox');
  });

  test(example + ' expand/collapse buttons', async ({ page, si }) => {
    await si.visitExample(example);

    await page.getByLabel('Show expand/collapse all buttons').check();
    await page
      .locator('a.si-tree-view-item-toggle si-icon[data-icon="itemCollapsedLeft"]')
      .first()
      .click();
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
    await page
      .locator('a.si-tree-view-item-toggle si-icon[data-icon="itemCollapsedLeft"]')
      .first()
      .click();
    await page.locator('.si-tree-view-item-object-data').getByText('Pune').click();

    await si.runVisualAndA11yTests('grouped-tree');
  });

  test('si-tree-view/si-tree-view-drag-drop-copy-from-list dragging', async ({ page, si }) => {
    await si.visitExample('si-tree-view/si-tree-view-drag-drop-copy-from-list');

    const device = page.locator('.catalog-item').getByText('HVAC unit');
    const building = page.locator('si-tree-view').getByText('Building A', { exact: true });
    const deviceBox = (await device.boundingBox())!;
    const buildingBox = (await building.boundingBox())!;

    await page.mouse.move(deviceBox.x + deviceBox.width / 2, deviceBox.y + deviceBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      buildingBox.x + buildingBox.width / 2,
      buildingBox.y + buildingBox.height / 2,
      {
        steps: 15
      }
    );

    await expect(page.locator('.cdk-drag-preview')).toBeVisible();
    await expect(
      page.locator('.drop-line-placeholder > .catalog-item.cdk-drag-placeholder')
    ).toBeAttached();
    await si.runVisualAndA11yTests('dragging-from-list', {
      // CDK temporarily moves the list item and its placeholder outside their semantic lists.
      axeRulesSet: [
        { id: 'aria-required-children', enabled: false },
        { id: 'listitem', enabled: false }
      ]
    });
    await page.mouse.up();
  });

  test('tree items use a line placeholder while the source anchor stays visible', async ({
    page,
    si
  }) => {
    await si.visitExample('si-tree-view/si-tree-view-drag-drop-copy');

    const device = page.locator('si-tree-view').first().getByText('HVAC unit', { exact: true });
    const building = page.locator('si-tree-view').last().getByText('Building A', { exact: true });
    const deviceBox = (await device.boundingBox())!;
    const buildingBox = (await building.boundingBox())!;

    await page.mouse.move(deviceBox.x + deviceBox.width / 2, deviceBox.y + deviceBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      deviceBox.x + deviceBox.width / 2 + 10,
      deviceBox.y + deviceBox.height / 2
    );

    const catalog = page.locator('si-tree-view').first();
    await expect(catalog.locator('.cdk-drag-placeholder').getByText('HVAC unit')).toBeVisible();

    await page.mouse.move(
      buildingBox.x + buildingBox.width / 2,
      buildingBox.y + buildingBox.height / 2,
      { steps: 15 }
    );

    const placeholder = page.locator(
      '.cdk-drop-list > .drop-line-placeholder.cdk-drag-placeholder'
    );
    await expect(placeholder).toHaveCSS('min-height', '0px');
    await expect(page.locator('.cdk-drag-anchor').getByText('HVAC unit')).toBeVisible();
    await si.runVisualAndA11yTests('dragging-from-tree', {
      // CDK temporarily renders tree-item clones outside the tree and hides the placeholder label.
      axeRulesSet: [
        { id: 'aria-required-parent', enabled: false },
        { id: 'aria-treeitem-name', enabled: false }
      ]
    });
    await page.mouse.up();
    await expect(catalog.getByText('HVAC unit', { exact: true })).toBeVisible();
    await expect(
      page.locator('si-tree-view').last().getByText('HVAC unit', { exact: true })
    ).toBeVisible();
  });
});
