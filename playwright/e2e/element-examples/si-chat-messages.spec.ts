/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect, test } from '../../support/test-helpers';

const example = 'si-chat-messages/si-ai-message';

test.describe('si-chat-messages', () => {
  test('summary source action', async ({ page, si }) => {
    await si.visitExample(example);

    const actions = page.locator('.ai-message-actions').getByRole('button');
    await expect(actions).toHaveCount(5);
    await expect(actions.nth(0)).toHaveAttribute('aria-label', 'Good response');
    await expect(actions.nth(1)).toHaveAttribute('aria-label', 'Bad response');
    await expect(actions.nth(2)).toHaveAttribute('aria-label', 'Copy response');
    await expect(actions.nth(3)).toHaveAttribute('aria-label', 'Additional actions');

    const sourceTrigger = actions.nth(4);
    await expect(sourceTrigger).toHaveAttribute('aria-label', 'View sources');
    await expect(sourceTrigger).toHaveAttribute('aria-expanded', 'false');
    await expect(sourceTrigger.locator('.chip')).not.toHaveAttribute('role');
    await expect(sourceTrigger.locator('.chip')).not.toHaveAttribute('tabindex');
    await expect(sourceTrigger).toHaveCSS('height', '32px');
    await expect(sourceTrigger.locator('.chip')).toHaveCSS('padding-inline', '8px');
    await expect(sourceTrigger.locator('.chip')).toHaveCSS('gap', '4px');
    await expect(sourceTrigger.locator('.si-body')).toHaveCSS('font-size', '14px');
    await expect(sourceTrigger.locator('si-icon')).toHaveCSS('font-size', '20px');
  });

  test('summary source popover', async ({ page, si }) => {
    await si.visitExample(example);

    const sourceTrigger = page.getByRole('button', { name: 'View sources' });
    await sourceTrigger.press('Space');

    const popover = page.getByRole('dialog', { name: 'Sources' });
    await expect(sourceTrigger).toHaveAttribute('aria-expanded', 'true');
    await expect(popover).toBeVisible();
    await expect(popover.getByText('Sources', { exact: true })).not.toBeVisible();
    await expect(popover).toHaveCSS('min-width', '230px');
    await expect(popover).toHaveCSS('max-width', '400px');
    await expect(popover).toHaveCSS('max-height', '400px');
    await expect(popover.locator('.popover-body')).toHaveCSS('padding', '4px');
    await expect(popover.locator('.popover-body')).toHaveCSS('overflow-y', 'auto');
    await expect(popover.locator('.source-list')).toHaveCSS('gap', '8px');
    await expect(popover.locator('.list-item')).toHaveCount(2);
    await expect(popover.locator('.list-item').first()).toHaveCSS('padding', '8px');

    const connectedDevicesSource = popover.getByRole('button', {
      name: /Connected Devices Guide/
    });
    await expect(connectedDevicesSource).toBeFocused();
    await expect(
      popover.getByText('Up to 250 devices may be connected to one controller.')
    ).toBeVisible();
    await expect(
      popover.getByRole('button', { name: /System Configuration Manual/ })
    ).toBeVisible();
    await expect(
      popover.getByText('Recommendations for configuring production installations.')
    ).toBeVisible();

    await si.runVisualAndA11yTests('summary-source-popover');

    await popover.press('Escape');
    await expect(popover).not.toBeVisible();
    await expect(sourceTrigger).toHaveAttribute('aria-expanded', 'false');
    await expect(sourceTrigger).toBeFocused();
  });

  test('chat container summary source popover', async ({ page, si }) => {
    await si.visitExample('si-chat-messages/si-chat-container');

    const sourceTriggers = page.getByRole('button', { name: 'View sources' });
    await expect(sourceTriggers).toHaveCount(2);

    const sourceTrigger = sourceTriggers.first();
    await sourceTrigger.click();

    const popover = page.getByRole('dialog', { name: 'Sources' });
    await expect(popover).toBeVisible();
    await expect(popover.getByRole('button', { name: /Data Analysis Guide/ })).toBeVisible();
    await expect(
      popover.getByText('Start by validating the structure and types of the input data.')
    ).toBeVisible();
    await expect(
      popover.getByRole('button', { name: /Python Performance Manual/ })
    ).toBeVisible();
  });
});
