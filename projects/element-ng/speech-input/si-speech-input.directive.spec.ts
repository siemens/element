/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SiChatInputComponent } from '@siemens/element-ng/chat-messages';

import {
  SI_SPEECH_INPUT_RECOGNITION,
  SiSpeechInputDirective,
  SpeechInputRecognition,
  SpeechInputResultEvent
} from './si-speech-input.directive';

class RecognitionMock implements SpeechInputRecognition {
  continuous = false;
  interimResults = false;
  lang = '';
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onresult: ((event: SpeechInputResultEvent) => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
  onspeechstart: (() => void) | null = null;
  onspeechend: (() => void) | null = null;
  start = vi.fn();
  stop = vi.fn();
  abort = vi.fn();
}

@Component({
  imports: [SiSpeechInputDirective],
  template: `<button
    type="button"
    siSpeechInput
    continuous
    noPermissionHint
    [disabled]="disabled()"
    [mode]="mode()"
    [silenceTimeout]="silenceTimeout()"
    [(value)]="value"
    (listeningChange)="changes($event)"
    (errorOccurred)="errors($event)"
    (transcript)="transcripts($event)"
    >Dictate</button
  >`
})
class TestHostComponent {
  readonly value = signal('Existing draft');
  readonly disabled = signal(false);
  readonly mode = signal<'toggle' | 'push-to-talk'>('toggle');
  readonly silenceTimeout = signal(0);
  readonly changes = vi.fn();
  readonly errors = vi.fn();
  readonly transcripts = vi.fn();
}

@Component({
  imports: [SiChatInputComponent, SiSpeechInputDirective],
  template: `<si-chat-input #chat [(value)]="value" (send)="send($event)">
    <button
      #speech="siSpeechInput"
      type="button"
      siSpeechInput
      [(value)]="value"
      (listeningChange)="
        $event || (speech.completionReason() === 'completed' && value() && chat.sendCurrent())
      "
      >Dictate</button
    >
  </si-chat-input>`
})
class SpeechChatTestComponent {
  readonly value = signal('Existing draft');
  readonly send = vi.fn();
}

describe('SiSpeechInputDirective', () => {
  let recognition: RecognitionMock;
  beforeEach(() => {
    recognition = new RecognitionMock();
    TestBed.configureTestingModule({
      providers: [{ provide: SI_SPEECH_INPUT_RECOGNITION, useValue: () => recognition }]
    });
  });

  const setup = async (): Promise<{
    fixture: ComponentFixture<TestHostComponent>;
    button: HTMLButtonElement;
    speech: SiSpeechInputDirective;
    host: TestHostComponent;
  }> => {
    const fixture = TestBed.createComponent(TestHostComponent);
    await fixture.whenStable();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    const speech: SiSpeechInputDirective = fixture.debugElement
      .query(By.directive(SiSpeechInputDirective))
      .injector.get(SiSpeechInputDirective);
    return { fixture, button, speech, host: fixture.componentInstance };
  };

  it('recognizes outside chat, replacing interim results and retaining final results', async () => {
    const { fixture, button, speech, host } = await setup();
    button.click();
    await fixture.whenStable();
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(host.changes).toHaveBeenCalledWith(true);
    expect(recognition).toMatchObject({ continuous: true, interimResults: true });
    recognition.onstart?.();
    recognition.onresult?.({ results: [{ isFinal: false, 0: { transcript: 'Hello' } }] });
    recognition.onresult?.({ results: [{ isFinal: false, 0: { transcript: 'Hello world' } }] });
    await fixture.whenStable();
    expect(host.value()).toBe('Existing draft Hello world');
    button.click();
    expect(recognition.stop).toHaveBeenCalledOnce();
    expect(host.changes).not.toHaveBeenCalledWith(false);
    recognition.onresult?.({ results: [{ isFinal: true, 0: { transcript: 'Hello world.' } }] });
    recognition.onend?.();
    await fixture.whenStable();
    expect(host.value()).toBe('Existing draft Hello world.');
    expect(host.changes).toHaveBeenLastCalledWith(false);
    expect(speech.completionReason()).toBe('completed');
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('restores the draft on denial and shows a recoverable permission hint', async () => {
    const { fixture, button, speech, host } = await setup();
    button.click();
    recognition.onerror?.({ error: 'not-allowed' });
    await fixture.whenStable();
    expect(host.value()).toBe('Existing draft');
    expect(host.errors).toHaveBeenCalledWith('not-allowed');
    expect(speech.completionReason()).toBe('error');
    expect(button).toHaveAttribute('aria-disabled', 'false');
    expect(button).toBeEnabled();
    expect(document.querySelector('[popover][role="alert"]')).toHaveTextContent(
      'Microphone access is blocked. To use voice input, allow the microphone for this site in your browser settings, then try again.'
    );
    button.click();
    await fixture.whenStable();
    expect(recognition.start).toHaveBeenCalledTimes(2);
    expect(document.querySelector('[popover][role="alert"]')).toBeNull();
  });

  it('ignores stale callbacks after cancellation', async () => {
    const { fixture, button, speech, host } = await setup();
    button.click();
    const lateResult = recognition.onresult;
    const lateError = recognition.onerror;
    speech.cancel();
    expect(speech.completionReason()).toBe('cancelled');
    host.value.set('Edited after cancel');
    lateResult?.({ results: [{ isFinal: true, 0: { transcript: 'stale' } }] });
    lateError?.({ error: 'not-allowed' });
    await fixture.whenStable();
    expect(host.value()).toBe('Edited after cancel');
    expect(host.errors).not.toHaveBeenCalled();
    expect(recognition.abort).toHaveBeenCalledOnce();
  });

  it('stops push-to-talk after release during permission startup', async () => {
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

  it('aborts recognition when disabled or destroyed', async () => {
    const { fixture, button, host } = await setup();
    button.click();
    host.disabled.set(true);
    await fixture.whenStable();
    expect(button).toBeDisabled();
    expect(recognition.abort).toHaveBeenCalledOnce();
    host.disabled.set(false);
    await fixture.whenStable();
    button.click();
    fixture.destroy();
    expect(recognition.abort).toHaveBeenCalledTimes(2);
  });

  it('waits for silence rather than stopping during speech', async () => {
    const { fixture, button, host } = await setup();
    host.silenceTimeout.set(2000);
    await fixture.whenStable();
    vi.useFakeTimers();
    try {
      button.click();
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
    } finally {
      vi.useRealTimers();
    }
  });

  it('starts and stops push-to-talk with pointer capture', async () => {
    const { fixture, button, host } = await setup();
    host.mode.set('push-to-talk');
    await fixture.whenStable();
    using capture = vi.spyOn(button, 'setPointerCapture').mockImplementation(() => undefined);
    button.dispatchEvent(new PointerEvent('pointerdown', { button: 0, pointerId: 1 }));
    recognition.onstart?.();
    expect(capture).toHaveBeenCalledWith(1);
    button.dispatchEvent(new PointerEvent('pointerup', { button: 0, pointerId: 1 }));
    button.dispatchEvent(new MouseEvent('click', { detail: 1 }));
    expect(recognition.start).toHaveBeenCalledOnce();
    expect(recognition.stop).toHaveBeenCalledOnce();
    recognition.onend?.();
    await fixture.whenStable();
  });

  it('ignores old callbacks even if an adapter is reused for another attempt', async () => {
    const { fixture, button, speech, host } = await setup();
    button.click();
    const lateResult = recognition.onresult;
    speech.cancel();
    button.click();
    lateResult?.({ results: [{ isFinal: true, 0: { transcript: 'Old attempt' } }] });
    await fixture.whenStable();
    expect(host.value()).toBe('Existing draft');
    expect(host.transcripts).not.toHaveBeenCalled();
  });

  it('reports unsupported recognition without requesting permission', async () => {
    TestBed.overrideProvider(SI_SPEECH_INPUT_RECOGNITION, { useFactory: () => undefined });
    const { button, speech, host } = await setup();
    expect(button).toBeDisabled();
    speech.start();
    expect(host.errors).toHaveBeenCalledWith('unsupported');
    expect(recognition.start).not.toHaveBeenCalled();
  });

  it('joins final and interim segments without duplicating the saved draft', async () => {
    const { fixture, button, speech, host } = await setup();
    button.click();
    recognition.onresult?.({
      results: [
        { isFinal: true, 0: { transcript: ' Hello ' } },
        { isFinal: false, 0: { transcript: ' world ' } }
      ]
    });
    await fixture.whenStable();
    expect(host.value()).toBe('Existing draft Hello world');
    expect(host.transcripts).toHaveBeenLastCalledWith('Hello world');
    speech.cancel();
    button.click();
    expect(speech.completionReason()).toBeUndefined();
  });

  it.each(['completed', 'cancelled', 'error'] as const)(
    'supports opt-in chat auto-send without sending a %s cancellation or failure',
    async reason => {
      const fixture = TestBed.createComponent(SpeechChatTestComponent);
      await fixture.whenStable();
      const button: HTMLButtonElement =
        fixture.nativeElement.querySelector('button[siSpeechInput]');
      const speech = fixture.debugElement
        .query(By.directive(SiSpeechInputDirective))
        .injector.get(SiSpeechInputDirective);
      button.click();
      recognition.onresult?.({ results: [{ isFinal: true, 0: { transcript: 'Hello' } }] });

      if (reason === 'completed') {
        recognition.onend?.();
      } else if (reason === 'cancelled') {
        speech.cancel();
      } else {
        recognition.onerror?.({ error: 'network' });
      }
      await fixture.whenStable();

      const expectedCalls =
        reason === 'completed' ? [[{ content: 'Existing draft Hello', attachments: [] }]] : [];
      expect(fixture.componentInstance.send.mock.calls).toEqual(expectedCalls);
      expect(fixture.componentInstance.value()).toBe(
        reason === 'completed' ? '' : 'Existing draft'
      );
    }
  );
});
