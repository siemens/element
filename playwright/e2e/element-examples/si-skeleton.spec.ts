/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { type ElementHandle } from '@playwright/test';

import { test } from '../../support/test-helpers';

test.describe('si-skeleton', () => {
  const example = 'si-skeleton/si-skeleton';

  let skeletonStyleTag: ElementHandle<Node> | undefined;

  test(example, async ({ page, si }) => {
    await si.visitExample(example);
    skeletonStyleTag = await page.addStyleTag({
      content: `.si-skeleton {
  background-position-x: var(--si-cy-skeleton-progress, 100%) !important;
}`
    });

    await page.evaluate(() => {
      document.documentElement.style.setProperty('--si-cy-skeleton-progress', '50%');
    });
    await si.runVisualAndA11yTests('state-25');

    await page.evaluate(() => {
      document.documentElement.style.setProperty('--si-cy-skeleton-progress', '-50%');
    });
    await si.runVisualAndA11yTests('state-75');
    // Reset the progress
    await page.evaluate(() => {
      document.documentElement.style.removeProperty('--si-cy-skeleton-progress');
    });
    await skeletonStyleTag?.evaluate(element => element.parentNode?.removeChild(element));
    await skeletonStyleTag?.dispose();
  });
});
