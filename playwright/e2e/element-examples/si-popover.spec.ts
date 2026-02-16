/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

test.describe('Popover', () => {
  const example = 'si-popover/si-popover';

  ['top', 'end', 'start', 'bottom'].forEach(direction => {
    test(direction, async ({ page, si }) => {
      await si.visitExample(example);

      const trigger = page.getByRole('button', { name: `Popover on ${direction}`, exact: true });
      await trigger.hover({ position: { x: 10, y: 10 } });
      await trigger.click({ position: { x: 10, y: 10 } });
      await expect(page.getByRole('dialog')).toBeVisible();

      await si.runVisualAndA11yTests(direction);
    });
  });

  ['with template', 'with template and context'].forEach(template => {
    test(template, async ({ page, si }) => {
      await si.visitExample(example);

      const trigger = page.getByRole('button', { name: `Popover ${template}`, exact: true });
      await trigger.hover({ position: { x: 10, y: 10 } });
      await trigger.click({ position: { x: 10, y: 10 } });
      await expect(page.getByRole('dialog')).toBeVisible();

      await si.runVisualAndA11yTests(template);
    });
  });

  test('focus on wrapper', async ({ page, si }) => {
    await si.visitExample(example);

    await page.getByRole('button', { name: 'Popover on top', exact: true }).press('Space');
    await expect(page.getByRole('dialog')).toBeVisible();

    await si.runVisualAndA11yTests('focus on wrapper');
  });

  test('focus on first focusable', async ({ page, si }) => {
    await si.visitExample(example);

    await page.getByRole('button', { name: 'Popover with template', exact: true }).press('Space');
    await expect(page.getByRole('dialog')).toBeVisible();

    await si.runVisualAndA11yTests('focus on first focusable');
  });
});
