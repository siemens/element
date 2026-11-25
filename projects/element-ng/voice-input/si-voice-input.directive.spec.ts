/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { onTestFinished } from 'vitest';
import { userEvent } from 'vitest/browser';

import {
  SI_VOICE_INPUT_RECOGNITION,
  SiVoiceInputDirective,
  VoiceInputRecognition,
  VoiceInputResultEvent
} from './si-voice-input.directive';

class RecognitionMock implements VoiceInputRecognition {
  continuous = false;
  interimResults = false;
  lang = '';
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onresult: ((event: VoiceInputResultEvent) => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
  onspeechstart: (() => void) | null = null;
  onspeechend: (() => void) | null = null;
  start = vi.fn();
  stop = vi.fn();
  abort = vi.fn();
}

@Component({
  imports: [SiVoiceInputDirective],
  template: `<button
    type="button"
    siVoiceInput
    continuous
    [disabled]="disabled()"
    [lang]="lang()"
    [mode]="mode()"
    [silenceTimeout]="silenceTimeout()"
    [(value)]="value"
    (listeningChange)="changes($event)"
    (completed)="completions($event)"
    (errorOccurred)="errors($event)"
    (transcript)="transcripts($event)"
    >Dictate</button
  >`
})
class TestHostComponent {
  readonly value = signal('Existing draft');
  readonly disabled = signal(false);
  readonly lang = signal('');
  readonly mode = signal<'toggle' | 'push-to-talk'>('toggle');
  readonly silenceTimeout = signal(0);
  readonly changes = vi.fn();
  readonly completions = vi.fn();
  readonly errors = vi.fn();
  readonly transcripts = vi.fn();
}

describe('SiVoiceInputDirective', () => {
  let recognition: RecognitionMock;
  beforeEach(() => {
    recognition = new RecognitionMock();
    TestBed.configureTestingModule({
      providers: [{ provide: SI_VOICE_INPUT_RECOGNITION, useValue: () => recognition }]
    });
  });

  const setup = async (): Promise<{
    fixture: ComponentFixture<TestHostComponent>;
    button: HTMLButtonElement;
    voiceInput: SiVoiceInputDirective;
    host: TestHostComponent;
  }> => {
    const fixture = TestBed.createComponent(TestHostComponent);
    await fixture.whenStable();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    const voiceInput: SiVoiceInputDirective = fixture.debugElement
      .query(By.directive(SiVoiceInputDirective))
      .injector.get(SiVoiceInputDirective);
    return { fixture, button, voiceInput, host: fixture.componentInstance };
  };

  it('reflects whether recognition is active', async () => {
    const { fixture, button } = await setup();
    await userEvent.click(button);
    await fixture.whenStable();
    expect(button).toHaveAttribute('aria-pressed', 'true');
    recognition.onend?.();
    await fixture.whenStable();
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('configures the provider for continuous interim results in the requested language', async () => {
    const { fixture, button, host } = await setup();
    host.lang.set('de-DE');
    await fixture.whenStable();
    await userEvent.click(button);
    expect(recognition).toMatchObject({ continuous: true, interimResults: true, lang: 'de-DE' });
  });

  it('replaces interim results and retains the final transcript', async () => {
    const { fixture, button, host } = await setup();
    await userEvent.click(button);
    recognition.onstart?.();
    recognition.onresult?.({ results: [{ isFinal: false, 0: { transcript: 'Hello' } }] });
    recognition.onresult?.({ results: [{ isFinal: false, 0: { transcript: 'Hello world' } }] });
    await fixture.whenStable();
    expect(host.value()).toBe('Existing draft Hello world');
    await userEvent.click(button);
    recognition.onresult?.({ results: [{ isFinal: true, 0: { transcript: 'Hello world.' } }] });
    recognition.onend?.();
    await fixture.whenStable();
    expect(host.value()).toBe('Existing draft Hello world.');
  });

  it('stays active after stopping until the provider ends the attempt', async () => {
    const { button, host } = await setup();
    await userEvent.click(button);
    expect(host.changes).toHaveBeenCalledWith(true);
    recognition.onstart?.();
    recognition.onresult?.({ results: [{ isFinal: true, 0: { transcript: 'Hello' } }] });
    await userEvent.click(button);
    expect(recognition.stop).toHaveBeenCalledOnce();
    expect(host.changes).not.toHaveBeenCalledWith(false);
    recognition.onend?.();
    expect(host.changes).toHaveBeenLastCalledWith(false);
    expect(host.completions).toHaveBeenCalledExactlyOnceWith('Hello');
  });

  it('keeps recognized text on error, skips completed, and allows retry after denial', async () => {
    const { fixture, button, host } = await setup();
    await userEvent.click(button);
    recognition.onresult?.({ results: [{ isFinal: false, 0: { transcript: 'Draft addition' } }] });
    recognition.onerror?.({ error: 'not-allowed' });
    await fixture.whenStable();
    expect(host.value()).toBe('Existing draft Draft addition');
    expect(host.errors).toHaveBeenCalledWith('not-allowed');
    expect(host.completions).not.toHaveBeenCalled();

    await userEvent.click(button);
    expect(recognition.start).toHaveBeenCalledTimes(2);
  });

  it('does not start the provider if a consumer cancels during the startup notification', async () => {
    const { button, voiceInput, host } = await setup();
    host.changes.mockImplementation((listening: boolean) => listening && voiceInput.cancel());

    await userEvent.click(button);

    expect(recognition.start).not.toHaveBeenCalled();
    expect(host.changes.mock.calls).toEqual([[true], [false]]);
    expect(host.completions).not.toHaveBeenCalled();
  });

  it('defers stopping until the provider starts', async () => {
    const { button } = await setup();
    await userEvent.click(button);
    await userEvent.click(button);
    expect(recognition.stop).not.toHaveBeenCalled();
    recognition.onstart?.();
    expect(recognition.stop).toHaveBeenCalledOnce();
  });

  it('ignores stale callbacks after cancellation', async () => {
    const { fixture, button, host } = await setup();
    await userEvent.click(button);
    const lateResult = recognition.onresult;
    const lateError = recognition.onerror;
    await userEvent.keyboard('{Escape}');
    expect(host.completions).not.toHaveBeenCalled();
    host.value.set('Edited after cancel');
    lateResult?.({ results: [{ isFinal: true, 0: { transcript: 'stale' } }] });
    lateError?.({ error: 'not-allowed' });
    await fixture.whenStable();
    expect(host.value()).toBe('Edited after cancel');
    expect(host.errors).not.toHaveBeenCalled();
    expect(recognition.abort).toHaveBeenCalledOnce();
  });

  it('aborts recognition when disabled or destroyed', async () => {
    const { fixture, button, host } = await setup();
    await userEvent.click(button);
    host.disabled.set(true);
    await fixture.whenStable();
    expect(button).toBeDisabled();
    expect(recognition.abort).toHaveBeenCalledOnce();
    host.disabled.set(false);
    await fixture.whenStable();
    await userEvent.click(button);
    fixture.destroy();
    expect(recognition.abort).toHaveBeenCalledTimes(2);
  });

  it('waits for silence rather than stopping during speech', async () => {
    const { fixture, button, host } = await setup();
    host.silenceTimeout.set(2000);
    await fixture.whenStable();
    await userEvent.click(button);
    vi.useFakeTimers();
    onTestFinished(() => {
      vi.useRealTimers();
    });

    recognition.onstart?.();
    recognition.onspeechstart?.();
    recognition.onresult?.({ results: [{ isFinal: false, 0: { transcript: 'Speaking' } }] });
    await vi.advanceTimersByTimeAsync(3000);
    expect(recognition.stop).not.toHaveBeenCalled();
    recognition.onspeechend?.();
    await vi.advanceTimersByTimeAsync(1999);
    expect(recognition.stop).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(recognition.stop).toHaveBeenCalledOnce();
    recognition.onend?.();
  });

  it('ignores old callbacks even if an adapter is reused for another attempt', async () => {
    const { fixture, button, voiceInput, host } = await setup();
    await userEvent.click(button);
    const lateResult = recognition.onresult;
    voiceInput.cancel();
    await fixture.whenStable();
    await userEvent.click(button);
    lateResult?.({ results: [{ isFinal: true, 0: { transcript: 'Old attempt' } }] });
    await fixture.whenStable();
    expect(host.value()).toBe('Existing draft');
    expect(host.transcripts).not.toHaveBeenCalled();
  });

  it('reports unsupported recognition without requesting permission', async () => {
    TestBed.overrideProvider(SI_VOICE_INPUT_RECOGNITION, { useFactory: () => undefined });
    const { button, voiceInput, host } = await setup();
    expect(button).toBeDisabled();
    voiceInput.start();
    expect(host.errors).toHaveBeenCalledWith('unsupported');
    expect(recognition.start).not.toHaveBeenCalled();
  });

  it('normalizes unrecognized provider errors to unknown', async () => {
    const { fixture, button, host } = await setup();
    await userEvent.click(button);
    recognition.onerror?.({ error: 'vendor-specific-error' });
    await fixture.whenStable();
    expect(host.errors).toHaveBeenCalledWith('unknown');
  });

  it('joins final and interim segments without duplicating the saved draft', async () => {
    const { fixture, button, voiceInput, host } = await setup();
    await userEvent.click(button);
    recognition.onresult?.({
      results: [
        { isFinal: true, 0: { transcript: ' Hello ' } },
        { isFinal: false, 0: { transcript: ' world ' } }
      ]
    });
    await fixture.whenStable();
    expect(host.value()).toBe('Existing draft Hello world');
    expect(host.transcripts).toHaveBeenLastCalledWith('Hello world');
    voiceInput.cancel();
    await fixture.whenStable();
    expect(host.value()).toBe('Existing draft');
    expect(host.completions).not.toHaveBeenCalled();
  });

  it.each(['completed', 'empty', 'cancelled', 'error'] as const)(
    'emits completed only on normal recognition end (%s)',
    async outcome => {
      const { fixture, button, voiceInput, host } = await setup();
      await userEvent.click(button);
      if (outcome !== 'empty') {
        recognition.onresult?.({ results: [{ isFinal: true, 0: { transcript: 'Hello' } }] });
      }

      if (outcome === 'completed' || outcome === 'empty') {
        recognition.onend?.();
      } else if (outcome === 'cancelled') {
        voiceInput.cancel();
      } else {
        recognition.onerror?.({ error: 'network' });
      }
      await fixture.whenStable();

      const expectedCalls =
        outcome === 'completed' ? [['Hello']] : outcome === 'empty' ? [['']] : [];
      expect(host.completions.mock.calls).toEqual(expectedCalls);
    }
  );

  it('starts and stops push-to-talk with pointer capture', async () => {
    const { fixture, button, host } = await setup();
    host.mode.set('push-to-talk');
    await fixture.whenStable();
    using capture = vi.spyOn(button, 'setPointerCapture');

    button.dispatchEvent(new PointerEvent('pointerdown', { button: 0, pointerId: 1 }));
    recognition.onstart?.();
    button.dispatchEvent(new PointerEvent('pointerdown', { button: 0, pointerId: 2 }));
    button.dispatchEvent(new PointerEvent('pointerup', { button: 0, pointerId: 2 }));
    expect(recognition.stop).not.toHaveBeenCalled();
    expect(capture).toHaveBeenCalledExactlyOnceWith(1);

    button.dispatchEvent(new PointerEvent('pointerup', { button: 0, pointerId: 1 }));
    button.dispatchEvent(new PointerEvent('lostpointercapture', { pointerId: 1 }));
    button.dispatchEvent(new MouseEvent('click', { detail: 1 }));
    expect(recognition.start).toHaveBeenCalledOnce();
    expect(recognition.stop).toHaveBeenCalledOnce();
    expect(recognition.abort).not.toHaveBeenCalled();
    recognition.onend?.();
    await fixture.whenStable();
  });

  it('stops push-to-talk after keyboard release during startup', async () => {
    const { fixture, button, host } = await setup();
    host.mode.set('push-to-talk');
    await fixture.whenStable();

    button.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    button.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true }));
    expect(recognition.stop).not.toHaveBeenCalled();
    recognition.onstart?.();
    expect(recognition.stop).toHaveBeenCalledOnce();
    recognition.onend?.();
    await fixture.whenStable();
    expect(host.changes.mock.calls).toEqual([[true], [false]]);
  });

  it('only stops a keyboard hold when the initiating key is released', async () => {
    const { fixture, button, host } = await setup();
    host.mode.set('push-to-talk');
    await fixture.whenStable();

    button.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    recognition.onstart?.();
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    button.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));
    expect(recognition.stop).not.toHaveBeenCalled();

    button.dispatchEvent(new KeyboardEvent('keyup', { key: ' ' }));
    expect(recognition.stop).toHaveBeenCalledOnce();
  });

  it.each(['pointercancel', 'lostpointercapture'])(
    'cancels without emitting completed when a hold is interrupted by %s',
    async event => {
      const { fixture, button, host } = await setup();
      host.mode.set('push-to-talk');
      await fixture.whenStable();

      button.dispatchEvent(new PointerEvent('pointerdown', { button: 0, pointerId: 1 }));
      recognition.onstart?.();
      recognition.onresult?.({ results: [{ isFinal: true, 0: { transcript: 'Hello' } }] });
      expect(host.value()).toBe('Existing draft Hello');
      const lateEnd = recognition.onend;

      button.dispatchEvent(new PointerEvent(event, { pointerId: 1 }));
      lateEnd?.();
      await fixture.whenStable();

      expect(recognition.abort).toHaveBeenCalledOnce();
      expect(host.completions).not.toHaveBeenCalled();
      expect(host.value()).toBe('Existing draft');
    }
  );
});
