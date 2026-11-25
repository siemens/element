/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import type { Page } from '@playwright/test';

import { expect, test } from '../../support/test-helpers';

const sampleEvent = 'mock-voice-input-sample';

function installRecognitionMock(page: Page): Promise<void> {
  return page.addInitScript(eventName => {
    class SimulatedRecognition {
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: ((event: { error: string }) => void) | null = null;
      onspeechstart: (() => void) | null = null;
      onresult:
        | ((event: {
            results: { isFinal: boolean; [index: number]: { transcript: string } }[];
          }) => void)
        | null = null;

      private emitResult = (): void => {
        this.onresult?.({
          results: [{ isFinal: false, 0: { transcript: 'Show energy consumption' } }]
        });
      };

      start(): void {
        queueMicrotask(() => {
          this.onstart?.();
          this.onspeechstart?.();
        });
        window.addEventListener(eventName, this.emitResult, { once: true });
      }

      stop(): void {
        this.abort();
        this.onend?.();
      }

      abort(): void {
        window.removeEventListener(eventName, this.emitResult);
      }
    }

    Object.defineProperty(window, 'SpeechRecognition', { value: SimulatedRecognition });
  }, sampleEvent);
}

test('voice waveform recording', async ({ page, si }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await installRecognitionMock(page);
  await si.visitExample('si-chat-messages/si-chat-voice-input');

  const input = page.locator('si-chat-input');
  const waveform = input.locator('si-voice-waveform');
  await page.getByRole('switch', { name: 'Provide custom audio levels' }).check();
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
  await input.getByRole('button', { name: 'Start dictation', exact: true }).click();
  await page.mouse.move(0, 0);
  await page.evaluate(eventName => window.dispatchEvent(new Event(eventName)), sampleEvent);
  await page.clock.runFor(960);
  await expect(waveform).toBeVisible();
  await expect(waveform.locator('span').last()).toHaveCSS('block-size', '16px');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.runFor(32);
  await page.clock.resume();

  await si.runVisualAndA11yTests('recording', { fullPage: false });
});
