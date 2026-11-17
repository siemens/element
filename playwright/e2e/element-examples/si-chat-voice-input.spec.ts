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
    await page.addInitScript(() => {
      type RecognitionResult = {
        isFinal: boolean;
        [index: number]: { transcript: string };
      };

      class SimulatedRecognition {
        continuous = false;
        interimResults = true;
        lang = '';
        onstart: (() => void) | null = null;
        onend: (() => void) | null = null;
        onresult: ((event: { results: RecognitionResult[] }) => void) | null = null;
        onerror: ((event: { error: string }) => void) | null = null;
        onspeechstart: (() => void) | null = null;
        onspeechend: (() => void) | null = null;
        private startupTimer?: ReturnType<Window['setTimeout']>;
        private transcriptionTimer?: ReturnType<Window['setInterval']>;
        private transcript = '';
        private active = false;

        start(): void {
          this.active = true;
          this.startupTimer = window.setTimeout(() => {
            this.onstart?.();
            if (!this.active) {
              return;
            }
            this.onspeechstart?.();
            const words = 'Show the energy consumption for the last seven days.'.split(' ');
            let wordCount = 0;
            this.transcriptionTimer = window.setInterval(() => {
              this.transcript = words.slice(0, ++wordCount).join(' ');
              this.emitResult(wordCount === words.length);
              if (wordCount === words.length) {
                window.clearInterval(this.transcriptionTimer);
                this.onspeechend?.();
                if (!this.continuous) {
                  this.onend?.();
                }
              }
            }, 500);
          }, 750);
        }

        stop(): void {
          this.abort();
          if (this.transcript) {
            this.emitResult(true);
          }
          this.onend?.();
        }

        abort(): void {
          this.active = false;
          window.clearTimeout(this.startupTimer);
          window.clearInterval(this.transcriptionTimer);
        }

        private emitResult(isFinal: boolean): void {
          this.onresult?.({ results: [{ isFinal, 0: { transcript: this.transcript } }] });
        }
      }

      Object.defineProperty(window, 'SpeechRecognition', { value: SimulatedRecognition });
    });
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
    await expect(textarea).toBeDisabled();
    await expect(input.getByRole('button', { name: 'Send', exact: true })).toBeDisabled();
    await expect(input.getByRole('button', { name: 'Attach file', exact: true })).toBeDisabled();
    await page.clock.runFor(1800);
    await expect(textarea).toHaveValue(/^Existing draft Show the/);
    await capture('listening');
    await stop.click();
    await page.clock.runFor(50);
    await expect(start).toBeFocused();
    await expect(textarea).toBeEditable();
    await expect(input.getByRole('button', { name: 'Send', exact: true })).toBeEnabled();
    await expect(input.getByRole('button', { name: 'Attach file', exact: true })).toBeEnabled();
    const retainedDraft = await textarea.inputValue();
    expect(retainedDraft).toMatch(/^Existing draft Show the/);
    await capture('review');

    await start.click();
    await page.keyboard.press('Escape');
    await page.clock.runFor(8000);
    await expect(textarea).toHaveValue(retainedDraft);
    await expect(start).toBeEnabled();
  });
}
