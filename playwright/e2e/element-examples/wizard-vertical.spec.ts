/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('si-wizard-vertical', () => {
  const example = 'si-wizard/si-wizard-playground';

  test(example, async ({ page, si }) => {
    await si.visitExample(example);
    await page.getByLabel('Vertical layout', { exact: true }).check();
    await si.runVisualAndA11yTests();

    await page.getByLabel('Show vertical divider').check();
    await si.runVisualAndA11yTests('vertical-divider');
    await page.getByLabel('Show vertical divider').uncheck();

    await page.getByLabel('Vertical layout', { exact: true }).uncheck();
    await si.runVisualAndA11yTests('horizontal');
  });

  test(example + ' on tab', async ({ page, si }) => {
    await si.visitExample(example);
    await page.getByLabel('Vertical layout', { exact: true }).check();
    // note: click in the top-left corner, otherwise the step gets the focus
    await (await page.locator('si-wizard')).click({ position: { x: 10, y: 10 } });
    await page.keyboard.press('Tab');
    const step = await page.locator('a:focus-visible');
    expect(step).toContainText('Step 2');

    await si.runVisualAndA11yTests('focus');
  });

  test(example + ' step numbers', async ({ page, si }) => {
    await si.visitExample(example);
    await page.getByLabel('Vertical layout', { exact: true }).check();
    await page.getByLabel('Number representation').check();
    await page.getByLabel('Number of steps', { exact: true }).fill('13');
    for (let i = 0; i < 10; i++) {
      await page.locator('si-wizard').getByLabel('Next').click();
    }

    await si.runVisualAndA11yTests('step-numbers');
  });

  test(example + ' small screen', async ({ page, si }) => {
    await si.visitExample(example);
    await page.getByLabel('Vertical layout', { exact: true }).check();
    await page.getByLabel('Show cancel button').check();
    await page.locator('si-wizard').getByLabel('Next').click();
    await page.setViewportSize({ width: 400, height: 660 });
    await si.runVisualAndA11yTests('small-screen', { snapshotDelay: 100 });
    await page.getByLabel('Show vertical divider').check();
    await si.runVisualAndA11yTests('small-screen-vertical-divider');
  });
});
