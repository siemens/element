/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-tour', () => {
  const example = 'si-tour/si-tour';

  test(example, async ({ page, si }) => {
    const nextClick = (): Promise<any> =>
      page.locator('si-tour button', { hasText: 'Next' }).click();

    const waitForTourStep = async (hasArrow = true): Promise<void> => {
      await expect(page.locator('si-tour .tour-content.show')).toBeVisible();
      if (hasArrow) {
        await expect(page.locator('si-tour .popover-arrow')).toBeVisible();
      }
    };

    await si.visitExample(example);
    await waitForTourStep();
    await si.runVisualAndA11yTests('first-step');

    await nextClick();
    await waitForTourStep();
    await si.runVisualAndA11yTests('second-step');

    await nextClick();
    await nextClick();
    await nextClick();
    await nextClick();
    await waitForTourStep();
    await si.runVisualAndA11yTests('open-menu');
    await nextClick();
    await waitForTourStep(false);
    await si.runVisualAndA11yTests('last-step');
  });
});
