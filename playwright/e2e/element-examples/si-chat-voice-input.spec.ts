/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import type { Page } from '@playwright/test';
import type { SpeechInputResultEvent } from '@siemens/element-ng/speech-input';

import { expect, test } from '../../support/test-helpers';

const installRecognitionMock = (page: Page): Promise<void> =>
  page.addInitScript(() => {
    class SimulatedRecognition {
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: ((event: { error: string }) => void) | null = null;
      onspeechstart: (() => void) | null = null;
      onresult: ((event: SpeechInputResultEvent) => void) | null = null;

      start(): void {
        queueMicrotask(() => {
          this.onstart?.();
          this.onspeechstart?.();
          this.onresult?.({
            results: [
              {
                isFinal: false,
                0: { transcript: 'Show the energy consumption for the last seven days.' }
              }
            ]
          });
        });
      }

      stop(): void {
        this.onend?.();
      }

      abort(): void {}
    }

    Object.defineProperty(window, 'SpeechRecognition', { value: SimulatedRecognition });
  });

test('listening', async ({ page, si }) => {
  await installRecognitionMock(page);
  await si.visitExample('si-chat-messages/si-chat-voice-input');

  const input = page.locator('si-chat-input');
  await input.getByRole('button', { name: 'Start dictation', exact: true }).click();
  await page.mouse.move(0, 0);
  await expect(input.getByRole('textbox')).toHaveValue(/^Show the energy consumption/);
  await si.runVisualAndA11yTests('listening');
});
