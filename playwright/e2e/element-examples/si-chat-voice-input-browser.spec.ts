import AxeBuilder from '@axe-core/playwright';

import { expect, test } from '../../support/test-helpers';

interface VoiceTestHarness {
  pendingPermission: boolean;
  deniedPermission: boolean;
  stoppedTracks: number;
  closedContexts: number;
  stops: number;
  aborts: number;
  resolvePermission(): void;
  emit(type: 'start' | 'speech' | 'result' | 'error' | 'end', text?: string[]): void;
  emitStaleResult(): void;
}

declare global {
  interface Window {
    voiceTest: VoiceTestHarness;
  }
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const instances: FakeRecognition[] = [];
    let staleResult: (() => void) | undefined;
    let resolvePermission: ((stream: unknown) => void) | undefined;
    const stream = { getTracks: () => [{ stop: () => window.voiceTest.stoppedTracks++ }] };

    class FakeRecognition {
      lang = '';
      continuous = false;
      interimResults = false;
      onstart: (() => void) | null = null;
      onspeechstart: (() => void) | null = null;
      onresult: ((event: { results: { transcript: string }[][] }) => void) | null = null;
      onerror: ((event: { error: string }) => void) | null = null;
      onend: (() => void) | null = null;

      constructor() {
        instances.push(this);
      }

      start(): void {
        const callback = this.onresult;
        staleResult = () => callback?.({ results: [[{ transcript: 'Stale text' }]] });
        this.onstart?.();
      }

      stop(): void {
        window.voiceTest.stops++;
      }

      abort(): void {
        window.voiceTest.aborts++;
      }
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

      async close(): Promise<void> {
        window.voiceTest.closedContexts++;
      }
    }

    Object.defineProperty(window, 'SpeechRecognition', {
      value: FakeRecognition,
      configurable: true
    });
    Object.defineProperty(window, 'AudioContext', { value: FakeAudioContext, configurable: true });
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
      configurable: true,
      value: async () => {
        if (window.voiceTest.deniedPermission) {
          throw new DOMException('Denied', 'NotAllowedError');
        }
        if (window.voiceTest.pendingPermission) {
          return new Promise(resolve => (resolvePermission = resolve));
        }
        return stream;
      }
    });
    window.voiceTest = {
      pendingPermission: false,
      deniedPermission: false,
      stoppedTracks: 0,
      closedContexts: 0,
      stops: 0,
      aborts: 0,
      resolvePermission: () => resolvePermission?.(stream),
      emit: (type, text = []) => {
        const active = instances[instances.length - 1];
        switch (type) {
          case 'start':
            active.onstart?.();
            break;
          case 'speech':
            active.onspeechstart?.();
            break;
          case 'result':
            active.onresult?.({ results: text.map(transcript => [{ transcript }]) });
            break;
          case 'error':
            active.onerror?.({ error: text[0] ?? 'network' });
            break;
          case 'end':
            active.onend?.();
        }
      },
      emitStaleResult: () => staleResult?.()
    };
  });
});

for (const viewport of [
  { width: 1000, height: 660 },
  { width: 320, height: 640 }
]) {
  test(`browser dictation lifecycle at ${viewport.width}px`, async ({ page, si }) => {
    await page.setViewportSize(viewport);
    await si.visitExample('si-chat-messages/si-chat-voice-input-browser');
    const input = page.locator('si-chat-input');
    const textarea = input.getByRole('textbox');
    const start = input.getByRole('button', { name: 'Start dictation', exact: true });
    const confirm = input.getByRole('button', { name: 'Confirm dictation', exact: true });
    const consent = page.getByRole('checkbox');

    await expect(start).toHaveCount(0);
    await textarea.fill('Existing draft');
    await consent.check();
    await start.click();
    await expect(consent).toBeDisabled();
    await expect(textarea).toHaveJSProperty('readOnly', true);
    await expect(input.getByRole('button', { name: 'Send', exact: true })).toBeDisabled();
    await expect(textarea).toHaveAttribute('placeholder', 'Listening...');
    await page.evaluate(() => window.voiceTest.emit('speech'));
    await expect(confirm).toBeVisible();
    await expect(confirm).toBeFocused();
    await page.evaluate(() => window.voiceTest.emit('result', ['Show energy']));
    await expect(textarea).toHaveValue('Existing draft Show energy');
    await page.evaluate(() => window.voiceTest.emit('result', ['Show energy consumption']));
    await expect(textarea).toHaveValue('Existing draft Show energy consumption');
    await expect
      .poll(() =>
        input
          .locator('si-voice-waveform span')
          .last()
          .evaluate(bar => bar.clientHeight)
      )
      .toBeGreaterThan(2);
    expect((await new AxeBuilder({ page }).include('app-sample').analyze()).violations).toEqual([]);
    expect(await input.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(false);

    await confirm.click();
    await expect(textarea).toHaveJSProperty('readOnly', true);
    expect(await page.evaluate(() => window.voiceTest.stops)).toBe(1);
    expect(await page.evaluate(() => window.voiceTest.stoppedTracks)).toBe(1);
    await page.evaluate(() => window.voiceTest.emit('result', ['Show energy consumption.']));
    await page.evaluate(() => window.voiceTest.emit('end'));
    await expect(textarea).toHaveValue('Existing draft Show energy consumption.');
    await expect(textarea).toBeEditable();
    await expect(textarea).toBeFocused();
    expect(await page.evaluate(() => window.voiceTest.closedContexts)).toBe(1);

    await start.click();
    await expect(textarea).toHaveAttribute('placeholder', 'Listening...');
    await page.evaluate(() => window.voiceTest.emit('result', ['Discard this']));
    await input.getByRole('button', { name: 'Cancel dictation', exact: true }).click();
    await textarea.fill('Edited after cancellation');
    await page.evaluate(() => window.voiceTest.emitStaleResult());
    await expect(textarea).toHaveValue('Edited after cancellation');

    await start.click();
    await expect(textarea).toHaveAttribute('placeholder', 'Listening...');
    await page.evaluate(() => window.voiceTest.emit('result', ['Natural completion']));
    await page.evaluate(() => window.voiceTest.emit('end'));
    await expect(textarea).toHaveValue('Edited after cancellation Natural completion');
    await expect(textarea).toBeEditable();
    await expect(consent).toBeEnabled();
  });
}

test('cancellation releases late microphone permission without overwriting edits', async ({
  page,
  si
}) => {
  await si.visitExample('si-chat-messages/si-chat-voice-input-browser');
  await page.evaluate(() => (window.voiceTest.pendingPermission = true));
  await page.getByRole('checkbox').check();
  const textarea = page.getByRole('textbox');
  await textarea.fill('Original');
  await page.getByRole('button', { name: 'Start dictation', exact: true }).click();
  await expect(textarea).toHaveAttribute('placeholder', 'Starting voice input...');
  await page.getByRole('button', { name: 'Cancel dictation', exact: true }).click();
  await textarea.fill('New draft');
  await page.evaluate(() => window.voiceTest.resolvePermission());
  await expect.poll(() => page.evaluate(() => window.voiceTest.stoppedTracks)).toBe(1);
  await expect(textarea).toHaveValue('New draft');
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('permission denial and recognition errors restore the protected draft', async ({
  page,
  si
}) => {
  await si.visitExample('si-chat-messages/si-chat-voice-input-browser');
  await page.getByRole('checkbox').check();
  const textarea = page.getByRole('textbox');
  await textarea.fill('Original');
  await page.evaluate(() => (window.voiceTest.deniedPermission = true));
  await page.getByRole('button', { name: 'Start dictation', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Microphone access was denied');
  await expect(textarea).toHaveValue('Original');
  await expect(textarea).toBeEditable();

  await page.evaluate(() => (window.voiceTest.deniedPermission = false));
  await page.getByRole('button', { name: 'Start dictation', exact: true }).click();
  await expect(textarea).toHaveAttribute('placeholder', 'Listening...');
  await page.evaluate(() => window.voiceTest.emit('result', ['Temporary']));
  await page.evaluate(() => window.voiceTest.emit('error', ['network']));
  await expect(page.getByRole('alert')).toContainText('Speech recognition failed');
  await expect(textarea).toHaveValue('Original');
  await expect(textarea).toBeEditable();
  expect(await page.evaluate(() => window.voiceTest.stoppedTracks)).toBe(1);
});

test('confirmation timeout keeps text and releases recognition', async ({ page, si }) => {
  await si.visitExample('si-chat-messages/si-chat-voice-input-browser');
  await page.clock.install();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Start dictation', exact: true }).click();
  await expect(page.getByRole('textbox')).toHaveAttribute('placeholder', 'Listening...');
  await page.evaluate(() => window.voiceTest.emit('result', ['Keep this']));
  await page.getByRole('button', { name: 'Confirm dictation', exact: true }).click();
  await page.clock.runFor(5100);
  await expect(page.getByRole('textbox')).toHaveValue('Keep this');
  await expect(page.getByRole('textbox')).toBeEditable();
  await expect(page.getByRole('alert')).toContainText('did not finish in time');
  expect(await page.evaluate(() => window.voiceTest.closedContexts)).toBe(1);
});

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

test('leaving the example releases audio and recognition', async ({ page, si }) => {
  await si.visitExample('si-chat-messages/si-chat-voice-input-browser');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Start dictation', exact: true }).click();
  await expect(page.getByRole('textbox')).toHaveAttribute('placeholder', 'Listening...');
  await page.evaluate(() => (location.hash = '#/viewer/preview?e=si-chat-messages/si-chat-input'));
  await expect.poll(() => page.evaluate(() => window.voiceTest.stoppedTracks)).toBe(1);
  expect(await page.evaluate(() => window.voiceTest.closedContexts)).toBe(1);
  expect(await page.evaluate(() => window.voiceTest.aborts)).toBe(1);
});
