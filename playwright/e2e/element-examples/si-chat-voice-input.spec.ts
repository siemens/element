/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import AxeBuilder from '@axe-core/playwright';

import { expect, test } from '../../support/test-helpers';

for (const viewport of [
  { name: 'desktop', width: 1000, height: 660 },
  { name: 'mobile', width: 320, height: 640 }
]) {
  test(`voice input dictation on ${viewport.name}`, async ({ page, si }, testInfo) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await si.visitExample('si-chat-messages/si-chat-voice-input');
    await page.clock.install();

    const input = page.locator('si-chat-input');
    const textarea = input.getByRole('textbox');
    const start = input.getByRole('button', { name: 'Start dictation', exact: true });
    const cancel = input.getByRole('button', { name: 'Cancel dictation', exact: true });
    const confirm = input.getByRole('button', { name: 'Confirm dictation', exact: true });
    const send = input.getByRole('button', { name: 'Send', exact: true });
    const automaticCompletion = page.getByRole('switch', { name: 'Automatic completion' });

    const checkState = async (state: string): Promise<void> => {
      const accessibility = await new AxeBuilder({ page })
        .include('si-chat-input')
        .include('.form-switch')
        .analyze();
      expect(accessibility.violations).toEqual([]);
      await testInfo.attach(state, {
        body: await input.screenshot(),
        contentType: 'image/png'
      });
    };

    await checkState('idle');
    await expect(automaticCompletion).toBeChecked();
    await textarea.fill('Existing draft');
    await start.focus();
    await page.keyboard.press('Space');
    await expect(cancel).toBeFocused();
    await expect(automaticCompletion).toBeDisabled();
    await expect(send).toBeDisabled();
    await expect(textarea).toHaveAttribute('placeholder', 'Starting voice input…');
    await expect(textarea).toHaveJSProperty('readOnly', true);
    await expect(start).toHaveCount(0);
    await testInfo.attach('listening', {
      body: await input.screenshot(),
      contentType: 'image/png'
    });
    await page.keyboard.press('Escape');
    await expect(textarea).toHaveValue('Existing draft');
    await expect(textarea).toBeFocused();
    await textarea.fill('Edited after cancellation');
    await page.clock.runFor(1500);
    await expect(textarea).toHaveValue('Edited after cancellation');
    await expect(start).toBeEnabled();
    await textarea.fill('Existing draft');

    await page.evaluate(() => {
      const originalSetTimeout = window.setTimeout;
      window.setTimeout = (handler, timeout, ...args) => {
        if (timeout === 750) {
          window.setTimeout = originalSetTimeout;
          throw new Error('Simulated recognition startup failure');
        }
        return originalSetTimeout(handler, timeout, ...args);
      };
    });
    await start.click();
    await page.clock.runFor(900);
    await expect(page.getByRole('alert')).toHaveText(
      'Voice input could not start. Please try again.'
    );
    await expect(textarea).toHaveValue('Existing draft');
    await expect(textarea).toBeEditable();
    await expect(start).toBeEnabled();
    await expect(send).toBeEnabled();

    await start.click();
    await expect(page.getByRole('alert')).toHaveCount(0);
    await input.getByRole('button', { name: 'Attach file', exact: true }).focus();
    await page.clock.runFor(1500);
    await expect(input.getByRole('button', { name: 'Attach file', exact: true })).toBeFocused();
    await expect(textarea).toHaveClass(/text-secondary/);
    await cancel.focus();
    await page.keyboard.press('Escape');
    await expect(textarea).toHaveValue('Existing draft');

    await start.click();
    await page.clock.runFor(1500);
    await expect(confirm).toBeFocused();
    await expect(textarea).toHaveValue(/^Existing draft Show/);
    await expect(input.getByRole('button', { name: 'Attach file', exact: true })).toBeEnabled();
    await expect(confirm.locator('si-icon')).toHaveAttribute('data-icon', 'elementCheckedFilled');
    await expect(cancel.locator('si-icon')).toHaveAttribute('data-icon', 'elementStateClose');
    await expect(textarea).toHaveClass(/text-secondary/);
    const provisionalColor = await textarea.evaluate(element => getComputedStyle(element).color);
    await checkState('recording');

    const hasHorizontalOverflow = await input.evaluate(
      element => element.scrollWidth > element.clientWidth
    );
    expect(hasHorizontalOverflow).toBe(false);

    await page.keyboard.down('Enter');
    await expect(textarea).toBeFocused();
    await page.keyboard.down('Enter');
    await page.keyboard.down('Enter');
    await page.keyboard.up('Enter');
    await expect(textarea).toBeEditable();
    await expect(send).toBeEnabled();
    const confirmedDraft = await textarea.inputValue();
    expect(confirmedDraft).toMatch(/^Existing draft Show/);
    await page.clock.runFor(6500);
    await expect(textarea).toHaveValue(confirmedDraft);
    await expect(textarea).not.toHaveClass(/text-secondary/);
    expect(await textarea.evaluate(element => getComputedStyle(element).color)).not.toBe(
      provisionalColor
    );
    await checkState('review');

    await textarea.fill('Existing draft');
    await start.click();
    await page.clock.runFor(6500);
    await expect(textarea).toHaveValue(
      'Existing draft Show the energy consumption for the last seven days.'
    );
    await expect(textarea).toBeFocused();
    await expect(textarea).toBeEditable();
    await expect(textarea).not.toHaveClass(/text-secondary/);
    await expect(start).toBeEnabled();
    await expect(send).toBeEnabled();
    await expect(confirm).toHaveCount(0);
    await expect(cancel).toHaveCount(0);
    await checkState('automatic completion');

    await expect(automaticCompletion).toBeEnabled();
    await automaticCompletion.uncheck();
    await textarea.fill('Existing draft');
    await start.click();
    await expect(automaticCompletion).toBeDisabled();
    await page.clock.runFor(6500);
    const completedDraft = 'Existing draft Show the energy consumption for the last seven days.';
    await expect(textarea).toHaveValue(completedDraft);
    await expect(textarea).toHaveJSProperty('readOnly', true);
    await expect(textarea).toHaveClass(/text-secondary/);
    await expect(confirm).toBeFocused();
    await expect(cancel).toBeEnabled();
    await page.clock.runFor(1500);
    await expect(textarea).toHaveValue(completedDraft);
    await expect(confirm).toBeEnabled();
    await checkState('user completion');
    await confirm.click();
    await expect(textarea).toHaveValue(completedDraft);
    await expect(textarea).toBeEditable();
    await expect(textarea).not.toHaveClass(/text-secondary/);
    await expect(automaticCompletion).toBeEnabled();
    await expect(automaticCompletion).not.toBeChecked();

    await send.click();
    await expect(textarea).toHaveValue('');
    await expect(send).toBeDisabled();
  });
}
