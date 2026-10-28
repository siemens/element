/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import AxeBuilder from '@axe-core/playwright';

import { expect, test } from '../../support/test-helpers';

interface VoiceTestHarness {
  emit(type: 'speech' | 'result' | 'error' | 'end', text?: string): void;
}

declare global {
  interface Window {
    voiceTest: VoiceTestHarness;
  }
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const instances: FakeRecognition[] = [];

    class FakeRecognition {
      onstart: (() => void) | null = null;
      onspeechstart: (() => void) | null = null;
      onresult: ((event: { results: { transcript: string }[][] }) => void) | null = null;
      onerror: ((event: { error: string }) => void) | null = null;
      onend: (() => void) | null = null;

      constructor() {
        instances.push(this);
      }

      start(): void {
        this.onstart?.();
      }

      stop(): void {}
      abort(): void {}
    }

    class FakeAudioContext {
      createAnalyser(): unknown {
        return {
          fftSize: 256,
          getFloatTimeDomainData: (samples: Float32Array) => samples.fill(0.2)
        };
      }

      createMediaStreamSource(): unknown {
        return { connect: () => undefined };
      }

      async resume(): Promise<void> {}
      async close(): Promise<void> {}
    }

    Object.defineProperty(window, 'SpeechRecognition', {
      value: FakeRecognition,
      configurable: true
    });
    Object.defineProperty(window, 'AudioContext', { value: FakeAudioContext, configurable: true });
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
      configurable: true,
      value: async () => ({ getTracks: () => [{ stop: () => undefined }] })
    });
    window.voiceTest = {
      emit: (type, text = '') => {
        const active = instances[instances.length - 1];
        switch (type) {
          case 'speech':
            active.onspeechstart?.();
            break;
          case 'result':
            active.onresult?.({ results: [[{ transcript: text }]] });
            break;
          case 'error':
            active.onerror?.({ error: 'network' });
            break;
          case 'end':
            active.onend?.();
        }
      }
    };
  });
});

for (const viewport of [
  { width: 1000, height: 660 },
  { width: 320, height: 640 }
]) {
  test(`browser dictation presentation at ${viewport.width}px`, async ({ page, si }) => {
    await page.setViewportSize(viewport);
    await si.visitExample('si-chat-messages/si-chat-voice-input-browser');
    const input = page.locator('si-chat-input');
    const textarea = input.getByRole('textbox');
    const start = input.getByRole('button', { name: 'Start dictation', exact: true });
    const confirm = input.getByRole('button', { name: 'Confirm dictation', exact: true });
    const cancel = input.getByRole('button', { name: 'Cancel dictation', exact: true });
    const checkAccessibility = async (): Promise<void> => {
      expect((await new AxeBuilder({ page }).include('app-sample').analyze()).violations).toEqual(
        []
      );
    };

    await textarea.fill('Compare energy usage');
    await start.click();
    await expect(textarea).toHaveAttribute('placeholder', 'Listening...');

    await page.evaluate(() => window.voiceTest.emit('result', 'including the previous month'));
    await expect(confirm).toBeFocused();
    await expect(textarea).toHaveValue('Compare energy usage including the previous month');
    await expect
      .poll(() =>
        input
          .locator('si-voice-waveform span')
          .first()
          .evaluate(bar => bar.clientHeight)
      )
      .toBeGreaterThan(2);

    await confirm.click();
    await expect(confirm).toBeDisabled();
    await expect(cancel).toBeFocused();
    await expect(input.getByRole('status')).toContainText('Finishing dictation');
    await expect(input.locator('button[aria-label="Send"]:not(:disabled)')).toHaveCount(0);
    const bars = input.locator('si-voice-waveform span');
    const frozenHeights = await bars.evaluateAll(elements =>
      elements.map(bar => bar.style.blockSize)
    );
    await page.evaluate(() => {
      window.voiceTest.emit('speech');
      window.voiceTest.emit('result', 'including the previous month.');
    });
    await expect(textarea).toHaveValue('Compare energy usage including the previous month.');
    expect(await bars.evaluateAll(elements => elements.map(bar => bar.style.blockSize))).toEqual(
      frozenHeights
    );
    await checkAccessibility();

    await page.evaluate(() => window.voiceTest.emit('end'));
    await expect(textarea).toBeEditable();
    await expect(textarea).toBeFocused();

    await start.click();
    await expect(textarea).toHaveAttribute('placeholder', 'Listening...');
    await page.evaluate(() => {
      window.voiceTest.emit('result', 'Check this unfinished text');
      window.voiceTest.emit('error');
    });
    await expect(page.getByRole('alert')).toContainText(
      'Your text was kept and may be incomplete.'
    );
    await expect(textarea).toBeEditable();
    expect(await input.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(false);
    await checkAccessibility();
  });
}

test('unsupported browsers keep text input available', async ({ page, si }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'SpeechRecognition', { value: undefined });
    Object.defineProperty(window, 'webkitSpeechRecognition', { value: undefined });
  });
  await si.visitExample('si-chat-messages/si-chat-voice-input-browser');
  await expect(page.getByRole('status')).toContainText('Voice input is unavailable');
  await expect(page.getByRole('button', { name: 'Start dictation', exact: true })).toHaveCount(0);
  await page.getByRole('textbox').fill('Typed message');
  await expect(page.getByRole('button', { name: 'Send', exact: true })).toBeEnabled();
});
