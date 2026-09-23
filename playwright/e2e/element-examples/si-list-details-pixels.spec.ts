/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-list-details pixel defaults', () => {
  const example = 'si-list-details/si-list-details-pixels';

  test('uses a fixed 300px list pane and resizes in pixels', async ({ page, si }) => {
    await si.visitExample(example);
    const split = page.locator('si-split');
    const listPart = split.locator('si-split-part').first();
    const listWidth = (): Promise<number> =>
      listPart.evaluate(element => element.getBoundingClientRect().width);
    await expect(listPart).toBeVisible();
    await expect.poll(listWidth).toBeCloseTo(300, 0);
    await si.runVisualAndA11yTests('default');

    const initialSplitWidth = (await split.boundingBox())!.width;
    await page.setViewportSize({ width: 1200, height: 660 });
    await expect
      .poll(async () => (await split.boundingBox())?.width)
      .toBeGreaterThan(initialSplitWidth);
    await expect.poll(listWidth).toBeCloseTo(300, 0);

    const splitHandle = split.locator('.si-split-gutter');
    const handleBox = (await splitHandle.boundingBox())!;
    const centerX = handleBox.x + handleBox.width / 2;
    const centerY = handleBox.y + handleBox.height / 2;
    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    await page.mouse.move(centerX + 100, centerY);
    await page.mouse.up();
    await expect.poll(listWidth).toBeCloseTo(400, 0);

    await page.setViewportSize({ width: 1100, height: 660 });
    await expect.poll(listWidth).toBeCloseTo(400, 0);
  });

  test('opens equipment details and returns to the list on mobile', async ({ page, si }) => {
    await page.setViewportSize({ width: 600, height: 800 });
    await si.visitExample(example);
    await expect(page.locator('si-split')).toHaveCount(0);

    const equipmentButton = page.getByRole('button', { name: /Room controller/ });
    await expect(equipmentButton).toBeInViewport();
    await si.runVisualAndA11yTests('mobile-list');

    await equipmentButton.click();
    await expect(page.getByText('Room 204, Building A', { exact: true })).toBeInViewport();
    const backButton = page.getByRole('button', { name: 'Back', exact: true });
    await expect(backButton).toBeFocused();
    await si.runVisualAndA11yTests('mobile-details');

    await backButton.click();
    await expect(equipmentButton).toBeInViewport();
    await expect(equipmentButton).toBeFocused();
  });
});
