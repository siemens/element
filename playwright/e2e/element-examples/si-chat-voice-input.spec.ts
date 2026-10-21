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

    const checkState = async (state: string): Promise<void> => {
      const accessibility = await new AxeBuilder({ page }).include('si-chat-input').analyze();
      expect(accessibility.violations).toEqual([]);
      await testInfo.attach(state, {
        body: await input.screenshot(),
        contentType: 'image/png'
      });
    };

    await checkState('idle');
    await textarea.fill('Existing draft');
    await start.focus();
    await page.keyboard.press('Space');
    await expect(cancel).toBeFocused();
    await expect(send).toBeDisabled();
    await expect(textarea).toHaveAttribute('placeholder', 'Listening…');
    await expect(textarea).toHaveJSProperty('readOnly', true);
    await testInfo.attach('listening', {
      body: await input.screenshot(),
      contentType: 'image/png'
    });
    await page.keyboard.press('Escape');
    await expect(textarea).toHaveValue('Existing draft');
    await expect(textarea).toBeFocused();

    await start.click();
    await page.clock.runFor(5500);
    await expect(confirm).toBeFocused();
    await expect(textarea).toHaveValue(
      'Existing draft Show the energy consumption for the last seven days.'
    );
    await expect(input.getByRole('button', { name: 'Attach file', exact: true })).toBeEnabled();
    await checkState('recording');

    const hasHorizontalOverflow = await input.evaluate(
      element => element.scrollWidth > element.clientWidth
    );
    expect(hasHorizontalOverflow).toBe(false);

    await page.keyboard.press('Enter');
    await expect(textarea).toBeFocused();
    await expect(textarea).toBeEditable();
    await expect(send).toBeEnabled();
    await expect(textarea).not.toHaveValue('');
    await checkState('review');

    await send.click();
    await expect(textarea).toHaveValue('');
    await expect(send).toBeDisabled();
  });
}
