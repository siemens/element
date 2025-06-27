/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { test } from '../../support/test-helpers';

test.describe('si-formly-dynamic-fields', () => {
  const example = 'si-formly/si-dynamic-form-fields';
  test(example, async ({ page, si }) => {
    await page.clock.setFixedTime(new Date('2021-01-01T00:00:00Z'));
    await si.visitExample(example, false);
    // height crop due to schema and model visible on demo
    await page.setViewportSize({ width: 1920, height: 1850 });
    await si.runVisualAndA11yTests();
  });
});
