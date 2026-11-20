/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import AxeBuilder from '@axe-core/playwright';

import { expect, test } from '../../support/test-helpers';

test.beforeEach(async ({ page }) => {
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
});

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
    const send = input.getByRole('button', { name: 'Send', exact: true });
    const waveform = input.locator('si-voice-waveform');

    const autoSend = page.getByRole('switch', { name: 'Send after dictation' });

    const checkState = async (state: string): Promise<void> => {
      const accessibility = await new AxeBuilder({ page }).include('app-sample').analyze();
      expect(accessibility.violations).toEqual([]);
      expect(
        await input
          .locator('.input-wrapper')
          .evaluate(element => element.scrollWidth > element.clientWidth)
      ).toBe(false);
      const dictationBounds = await input.locator('button[siSpeechInput]').evaluate(element => {
        const bounds = element.getBoundingClientRect();
        return { right: bounds.right, top: bounds.top };
      });
      const submitBounds = await send.evaluate(element => {
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

    await checkState('idle');
    await expect(autoSend).not.toBeChecked();
    await expect(waveform).toHaveCount(0);
    await textarea.fill('Existing draft');
    await start.focus();
    await page.keyboard.press('Space');
    await page.clock.runFor(50);
    await expect(stop).toBeFocused();
    await expect(stop).toHaveAttribute('aria-pressed', 'true');
    await expect(autoSend).toBeDisabled();
    await expect(send).toBeDisabled();
    await expect(textarea).toBeDisabled();
    await expect(start).toHaveCount(0);
    await expect(waveform).toHaveAttribute('aria-hidden', 'true');
    await expect(waveform).toHaveCSS('width', '120px');
    await expect(waveform).toHaveCSS('height', '16px');
    await expect(waveform.locator('span')).toHaveCount(41);
    expect(
      await waveform.locator('span').evaluateAll(bars => bars.every(bar => bar.clientHeight === 2))
    ).toBe(true);
    await testInfo.attach('startup', {
      body: await input.screenshot(),
      contentType: 'image/png'
    });
    await page.keyboard.press('Escape');
    await page.clock.runFor(50);
    await expect(textarea).toHaveValue('Existing draft');
    await expect(start).toBeFocused();
    await expect(waveform).toHaveCount(0);
    await textarea.fill('Edited after cancellation');
    await page.clock.runFor(1500);
    await expect(textarea).toHaveValue('Edited after cancellation');
    await expect(start).toBeEnabled();
    await textarea.fill('Existing draft');

    await page.evaluate(() => {
      const browserWindow: Window = window;
      const originalSetTimeout = browserWindow.setTimeout;
      browserWindow.setTimeout = (handler, timeout, ...args) => {
        if (timeout === 750) {
          browserWindow.setTimeout = originalSetTimeout;
          throw new Error('Simulated recognition startup failure');
        }
        return originalSetTimeout(handler, timeout, ...args);
      };
    });
    await start.click();
    await page.clock.runFor(900);
    await expect(page.getByRole('alert')).toHaveText('Voice input failed: start-failed');
    await expect(textarea).toHaveValue('Existing draft');
    await expect(textarea).toBeEditable();
    await expect(start).toBeEnabled();
    await expect(send).toBeEnabled();

    await start.click();
    await expect(page.getByRole('alert')).toHaveCount(0);
    await page.clock.runFor(1500);
    await expect(textarea).toHaveValue(/^Existing draft Show/);
    await expect(stop).toBeFocused();
    await page.keyboard.press('Escape');
    await page.clock.runFor(50);
    await expect(textarea).toHaveValue('Existing draft');

    await start.click();
    await page.clock.runFor(1800);
    await expect(stop).toBeFocused();
    await expect(textarea).toHaveValue(/^Existing draft Show/);
    await expect(input.getByRole('button', { name: 'Attach file', exact: true })).toBeDisabled();
    await expect(stop.locator('si-icon')).toHaveAttribute('data-icon', 'elementStopFilled');
    expect(
      await waveform.locator('span').evaluateAll(bars => bars.some(bar => bar.clientHeight > 2))
    ).toBe(true);
    await checkState('recording');

    await stop.click();
    await page.clock.runFor(50);
    await expect(start).toBeFocused();
    await expect(textarea).toBeEditable();
    await expect(send).toBeEnabled();
    await expect(waveform).toHaveCount(0);
    const retainedDraft = await textarea.inputValue();
    expect(retainedDraft).toMatch(/^Existing draft Show the/);
    await page.clock.runFor(6500);
    await expect(textarea).toHaveValue(retainedDraft);
    await checkState('review');

    await autoSend.check();
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
    await start.click();
    await page.clock.runFor(800);
    await expect(autoSend).toBeDisabled();
    await stop.click();
    await page.clock.runFor(50);
    await expect(autoSend).toBeEnabled();
    await expect(textarea).toHaveValue(retainedDraft);
    await page.clock.resume();

    await textarea.fill('');
    await start.click();
    await expect(autoSend).toBeDisabled();
    await page.clock.runFor(8500);
    await expect(start).toBeEnabled();
    await expect(textarea).toHaveValue('');
    await expect(send).toBeDisabled();
    await expect(waveform).toHaveCount(0);
    await checkState('auto-send');
  });

  for (const state of ['listening', 'recording']) {
    test(`voice waveform ${state} on ${viewport.name}`, async ({ page, si }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await si.visitExample('si-chat-messages/si-chat-voice-input');
      await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
      await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
      const stopExampleTimers = await page.evaluateHandle(() => {
        const browserWindow: Window = window;
        const timers: number[] = [];
        const originalTimeout = browserWindow.setTimeout;
        const originalInterval = browserWindow.setInterval;
        browserWindow.setTimeout = (handler, timeout, ...args) => {
          const timer = originalTimeout(handler, timeout, ...args);
          if (timeout === 750) timers.push(timer);
          return timer;
        };
        browserWindow.setInterval = (handler, timeout, ...args) => {
          const timer = originalInterval(handler, timeout, ...args);
          if (timeout === 60 || timeout === 500) timers.push(timer);
          return timer;
        };
        return () => {
          for (const timer of timers) browserWindow.clearTimeout(timer);
          browserWindow.setTimeout = originalTimeout;
          browserWindow.setInterval = originalInterval;
        };
      });
      await page.getByRole('switch', { name: 'Simulated audio levels' }).check();
      await page.clock.runFor(16);

      const input = page.locator('si-chat-input');
      const waveform = input.locator('si-voice-waveform');
      const bars = waveform.locator('span');
      const heights = (): Promise<string[]> =>
        bars.evaluateAll(elements => elements.map(element => element.style.blockSize));
      const setReducedMotion = async (reduced: boolean): Promise<void> => {
        const mediaChanged = await page.evaluateHandle(() => ({
          delivered: new Promise<void>(resolve => {
            matchMedia('(prefers-reduced-motion: reduce)').addEventListener(
              'change',
              () => resolve(),
              { once: true }
            );
          })
        }));
        await page.emulateMedia({ reducedMotion: reduced ? 'reduce' : 'no-preference' });
        await mediaChanged.evaluate(notification => notification.delivered);
        await mediaChanged.dispose();
        await page.clock.runFor(16);
      };

      await input.getByRole('button', { name: 'Start dictation', exact: true }).click();
      await page.clock.runFor(16);
      await expect(page.getByRole('switch', { name: 'Simulated audio levels' })).toBeDisabled();
      await expect(
        input.getByRole('button', { name: 'Stop dictation', exact: true })
      ).toBeFocused();
      if (state === 'listening') {
        await stopExampleTimers.evaluate(stop => stop());
        await stopExampleTimers.dispose();
        await page.clock.resume();
        await si.runVisualAndA11yTests(`listening-${viewport.name}`, { fullPage: false });
        return;
      }

      await page.clock.runFor(2400);
      await expect(
        input.getByRole('button', { name: 'Stop dictation', exact: true })
      ).toBeFocused();
      await expect(bars.last()).toHaveCSS('height', '16px');
      await waveform.evaluate(element => {
        for (const animation of element.getAnimations({ subtree: true })) {
          animation.pause();
          animation.currentTime = 59;
        }
      });
      expect(
        await waveform.evaluate(element => {
          const bounds = element.getBoundingClientRect();
          const newest = element.querySelector('span:last-child')!.getBoundingClientRect();
          const visibleBars = [...element.querySelectorAll('span')].filter(bar => {
            const sample = bar.getBoundingClientRect();
            return sample.left < bounds.right && sample.right > bounds.left;
          });
          return (
            newest.left < bounds.right && newest.right > bounds.left && visibleBars.length === 40
          );
        })
      ).toBe(true);
      await waveform.evaluate(element => {
        for (const animation of element.getAnimations({ subtree: true })) {
          animation.finish();
        }
      });
      expect(
        await waveform.evaluate(element => {
          const bounds = element.getBoundingClientRect();
          return [...element.querySelectorAll('span')].every(bar => {
            const sample = bar.getBoundingClientRect();
            return sample.top >= bounds.top && sample.bottom <= bounds.bottom;
          });
        })
      ).toBe(true);

      await page.clock.runFor(60);
      await setReducedMotion(true);
      await expect
        .poll(() => waveform.evaluate(element => element.getAnimations({ subtree: true }).length))
        .toBe(0);
      const frozenHeights = await heights();
      expect(
        await waveform.evaluate(element => {
          const bounds = element.getBoundingClientRect();
          const newest = element.querySelector('span:last-child')!.getBoundingClientRect();
          return newest.left >= bounds.left && newest.right <= bounds.right;
        })
      ).toBe(true);
      await page.clock.runFor(600);
      expect(await heights()).toEqual(frozenHeights);

      await setReducedMotion(false);
      await expect
        .poll(() => waveform.evaluate(element => element.getAnimations({ subtree: true }).length))
        .toBeGreaterThan(0);
      await page.clock.runFor(120);
      await expect(bars.last()).toHaveCSS('height', '2px');
      expect(await heights()).not.toEqual(frozenHeights);

      await stopExampleTimers.evaluate(stop => stop());
      await stopExampleTimers.dispose();
      await waveform.evaluate(element => {
        for (const animation of element.getAnimations({ subtree: true })) animation.finish();
      });
      await page.clock.resume();
      await si.runVisualAndA11yTests(`recording-${viewport.name}`, { fullPage: false });
    });
  }
}
