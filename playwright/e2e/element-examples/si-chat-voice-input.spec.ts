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
  test(`speech input on ${viewport.name}`, async ({ page, si }, testInfo) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await si.visitExample('si-chat-messages/si-chat-voice-input');
    await page.clock.install();
    const input = page.locator('si-chat-input');
    const textarea = input.getByRole('textbox');
    const start = input.getByRole('button', { name: 'Start dictation', exact: true });
    const stop = input.getByRole('button', { name: 'Stop dictation', exact: true });

    const capture = async (state: string): Promise<void> => {
      const accessibility = await new AxeBuilder({ page }).include('app-sample').analyze();
      expect(accessibility.violations).toEqual([]);
      expect(await input.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(
        false
      );
      const dictationBounds = await input.locator('button[siSpeechInput]').evaluate(element => {
        const bounds = element.getBoundingClientRect();
        return { right: bounds.right, top: bounds.top };
      });
      const submitBounds = await input
        .getByRole('button', { name: 'Send', exact: true })
        .evaluate(element => {
          const bounds = element.getBoundingClientRect();
          return { left: bounds.left, top: bounds.top };
        });
      expect(submitBounds.left - dictationBounds.right).toBeGreaterThanOrEqual(0);
      expect(submitBounds.left - dictationBounds.right).toBeLessThanOrEqual(8);
      expect(Math.abs(submitBounds.top - dictationBounds.top)).toBeLessThan(1);
      await testInfo.attach(state, {
        body: await page.locator('app-sample').screenshot(),
        contentType: 'image/png'
      });
    };

    await capture('idle');
    await textarea.fill('Existing draft');
    await start.focus();
    await page.keyboard.press('Space');
    await page.clock.runFor(50);
    await expect(stop).toBeFocused();
    await expect(stop).toHaveAttribute('aria-pressed', 'true');
    await page.clock.runFor(1800);
    await expect(textarea).toHaveValue(/^Existing draft Show the/);
    await capture('listening');
    await stop.click();
    await page.clock.runFor(50);
    await expect(start).toBeFocused();
    const retainedDraft = await textarea.inputValue();
    expect(retainedDraft).toMatch(/^Existing draft Show the/);
    await capture('review');

    await start.click();
    await page.keyboard.press('Escape');
    await page.clock.runFor(8000);
    await expect(textarea).toHaveValue(retainedDraft);
    await expect(start).toBeEnabled();

    await page.getByRole('combobox', { name: 'Voice input mode' }).selectOption('push-to-talk');
    await page.clock.runFor(50);
    await start.focus();
    await page.keyboard.down('Space');
    await page.clock.runFor(1800);
    await page.keyboard.up('Space');
    await page.clock.runFor(50);
    await expect(start).toBeFocused();
    await expect(textarea).toHaveValue(`${retainedDraft} Show the`);

    await page.getByRole('combobox', { name: 'Voice input mode' }).selectOption('toggle');
    await page.clock.runFor(50);
    await page.getByRole('switch', { name: 'Send after dictation' }).check();
    await textarea.fill('');
    await start.click();
    await page.clock.runFor(8500);
    await expect(start).toBeEnabled();
    await expect(textarea).toHaveValue('');
    await capture('auto-send');
  });
}
