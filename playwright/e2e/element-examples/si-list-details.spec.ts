/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-list-details', () => {
  const example = 'si-list-details/si-list-details';

  test(example, async ({ page, si }) => {
    await si.visitExample(example);
    await expect(page.locator('ngx-datatable')).toBeInViewport({ ratio: 0.05 });
    await expect(page.getByText('No entity selected.')).toBeInViewport({ ratio: 0.05 });
    await si.runVisualAndA11yTests(undefined, {
      axeRulesSet: [{ id: 'scrollable-region-focusable', enabled: false }]
    });

    // Select first row
    await page.locator('ngx-datatable .datatable-body-row').first().click();
    await expect(page.getByText('{ "id": ')).toBeInViewport({ ratio: 0.05 });
    await si.runVisualAndA11yTests('first-details', {
      axeRulesSet: [{ id: 'scrollable-region-focusable', enabled: false }]
    });

    // Select second row
    await page.locator('ngx-datatable .datatable-body-row').nth(1).click();
    await expect(page.getByText('{ "id": ')).toBeInViewport({ ratio: 0.05 });
    await si.runVisualAndA11yTests('second-details', {
      axeRulesSet: [{ id: 'scrollable-region-focusable', enabled: false }]
    });
  });

  test(`${example} – small viewport`, async ({ page, si }) => {
    await si.visitExample(example);
    await page.setViewportSize({ width: 600, height: 800 }); // mdMinimum is 768px
    await expect(page.locator('si-split')).toHaveCount(0);
    await expect(page.locator('ngx-datatable')).toBeInViewport({ ratio: 0.05 });
    await expect(
      page.getByText('No entity selected.').or(page.getByText('{ "id": '))
    ).not.toBeInViewport({ ratio: 0.05 });
    await si.runVisualAndA11yTests('small-viewport', {
      axeRulesSet: [
        { id: 'scrollable-region-focusable', enabled: false },
        { id: 'role-img-alt', enabled: false } // Image has labelledby, but no alt text
      ]
    });

    // Select first row
    await page.locator('ngx-datatable datatable-body-cell').first().click();
    await expect(page.locator('ngx-datatable')).not.toBeInViewport({ ratio: 0.05 });
    await expect(page.getByText('{ "id": ')).toBeInViewport({ ratio: 0.05 });
    await si.runVisualAndA11yTests('small-viewport-first-details', {
      axeRulesSet: [
        { id: 'scrollable-region-focusable', enabled: false },
        { id: 'role-img-alt', enabled: false } // Image has labelledby, but no alt text
      ]
    });

    // Click back button
    await page.locator('button').and(page.getByText('Back')).click();
    await expect(page.locator('ngx-datatable')).toBeInViewport({ ratio: 0.05 });
    await si.runVisualAndA11yTests('small-viewport-back-list', {
      axeRulesSet: [
        { id: 'scrollable-region-focusable', enabled: false },
        { id: 'role-img-alt', enabled: false } // Image has labelledby, but no alt text
      ]
    });

    // Select second row
    await page.locator('ngx-datatable .datatable-body-row').nth(1).click();
    await expect(page.locator('ngx-datatable')).not.toBeInViewport({ ratio: 0.05 });
    await expect(page.getByText('{ "id": ')).toBeInViewport({ ratio: 0.05 });
    await si.runVisualAndA11yTests('small-viewport-second-details', {
      axeRulesSet: [
        { id: 'scrollable-region-focusable', enabled: false },
        { id: 'role-img-alt', enabled: false } // Image has labelledby, but no alt text
      ]
    });
  });

  test(`${example} – resized`, async ({ page, si }) => {
    await si.visitExample(example);
    await expect(page.locator('si-split')).toHaveCount(1);
    await expect(page.locator('ngx-datatable')).toBeInViewport({ ratio: 0.05 });
    await expect(page.getByText('No entity selected.')).toBeInViewport({ ratio: 0.05 });
    // Resize the split
    const split = page.locator('si-split');
    const splitHandle = split.locator('.si-split-gutter');
    const splitHandleBox = (await splitHandle.boundingBox())!;
    const x = splitHandleBox.x + splitHandleBox.width / 2;
    const y = splitHandleBox.y + splitHandleBox.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x - 100, y);
    await page.mouse.up();
    await expect(page.locator('ngx-datatable')).toBeInViewport({ ratio: 0.05 });
    await expect(page.getByText('No entity selected.')).toBeInViewport({ ratio: 0.05 });
    // Click one of the items in the table
    await page.locator('ngx-datatable .datatable-body-row').first().click();
    await expect(page.locator('ngx-datatable')).toBeInViewport({ ratio: 0.05 });
    await expect(page.getByText('{ "id": ')).toBeInViewport({ ratio: 0.05 });
    await si.runVisualAndA11yTests('resized', {
      axeRulesSet: [{ id: 'scrollable-region-focusable', enabled: false }]
    });
  });
});
