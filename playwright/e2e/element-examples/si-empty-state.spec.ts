/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-empty-state', () => {
  const example = 'si-empty-state/si-empty-state-playground';

  test('basic example', async ({ si }) => {
    await si.visitExample('si-empty-state/si-empty-state', true);
    await si.runVisualAndA11yTests();
  });

  test('container height can be adjusted with the keyboard', async ({ page, si }) => {
    await page.setViewportSize({ width: 1000, height: 800 });
    await si.visitExample(example, false);
    await page.getByLabel('Show actions').uncheck();
    const slider = page.getByRole('slider', { name: 'Container height' });
    const container = page.locator('si-empty-state').locator('..');
    await expect(container).toHaveClass(/card/);
    const settings = page.locator('.e2e-ignore');

    await slider.press('Home');
    await expect(slider).toHaveValue('60');
    await expect(container).toHaveCSS('block-size', '60px');
    await expect(page.locator('.state-icon')).toBeHidden();
    await expect(page.locator('.state-content')).toBeHidden();

    await slider.press('ArrowRight');
    await expect(slider).toHaveValue('61');
    await expect(page.getByText('Container height: 61 px', { exact: true })).toBeVisible();
    await expect(container).toHaveCSS('block-size', '61px');

    await slider.press('End');
    await expect(slider).toHaveValue('400');
    await expect(container).toHaveCSS('block-size', '400px');
    await expect(page.locator('.state-icon')).toBeVisible();
    await expect(page.locator('.state-content')).toBeVisible();
  });

  for (const actions of [true, false]) {
    test.describe(actions ? 'with actions' : 'without actions', () => {
      const variants = [
        { name: 'full', height: actions ? 220 : 164, icon: true, description: true },
        { name: 'icon-hidden', height: actions ? 140 : 84, icon: false, description: true },
        {
          name: 'icon-and-content-hidden',
          height: actions ? 112 : 60,
          icon: false,
          description: false
        },
        {
          name: 'none',
          height: actions ? 112 : 60,
          icon: true,
          description: true
        }
      ];

      for (const variant of variants) {
        test(variant.name, async ({ page, si }) => {
          await si.visitExample(example, false);
          await page.getByLabel('Show actions').setChecked(actions);
          await page.getByLabel('Responsive mode').setChecked(variant.name !== 'none');

          await page
            .getByRole('slider', { name: 'Container height' })
            .evaluate((slider: HTMLInputElement, height) => {
              slider.value = String(height);
              slider.dispatchEvent(new Event('input', { bubbles: true }));
            }, variant.height);
          await expect(page.getByRole('slider')).toHaveValue(String(variant.height));

          await page.addStyleTag({ content: '.e2e-ignore { display: none; }' });

          const emptyState = page.locator('si-empty-state');
          await expect(emptyState.locator('span.si-h3')).toHaveText('No users');
          await expect(emptyState.locator('span.si-h3')).toBeVisible();
          await expect(emptyState.locator('.state-icon')).toBeVisible({
            visible: variant.icon
          });
          await expect(emptyState.locator('.state-content')).toBeVisible({
            visible: variant.description
          });
          await expect(emptyState.getByRole('button')).toHaveCount(actions ? 2 : 0);
          const card = emptyState.locator('..');
          await expect(card).toHaveAttribute(
            'style',
            new RegExp(`block-size: ${variant.height}px`)
          );
          const box = await card.boundingBox();
          expect(box).not.toBeNull();
          if (!box) {
            throw new Error('The empty-state card must have a bounding box.');
          }
          await page.setViewportSize({
            width: page.viewportSize()!.width,
            height: Math.ceil(box.y + box.height + 24)
          });
          await si.runVisualAndA11yTests(
            `${actions ? 'with-actions' : 'without-actions'}--${variant.name}`,
            { fullPage: false }
          );
        });
      }
    });
  }
});
