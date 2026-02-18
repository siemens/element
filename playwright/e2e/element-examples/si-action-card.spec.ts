/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-action-card', () => {
  const example = 'si-card/si-action-card';

  test(example, async ({ page, si }) => {
    await si.visitExample(example, false);

    const card = page.getByRole('button', {
      name: 'FS20'
    });

    await expect(card).toBeVisible();

    await card.click();

    // this moves cursor hover effect off the card
    await page.click('body', { position: { x: 0, y: 0 } });

    await expect(card).toHaveAttribute('aria-pressed', 'true');

    await si.runVisualAndA11yTests();

    const anotherCard = page.getByRole('button', {
      name: 'Natural Gas Usage'
    });

    await anotherCard.hover();

    await si.runVisualAndA11yTests('hover');
  });
});
