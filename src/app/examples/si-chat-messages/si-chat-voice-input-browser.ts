/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ChatInputAttachment, SiChatInputComponent } from '@siemens/element-ng/chat-messages';
import { LOG_EVENT } from '@siemens/live-preview';

interface RecognitionResult {
  readonly [index: number]: { readonly transcript: string };
}

interface BrowserRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onspeechstart: (() => void) | null;
  onresult: ((event: { results: ArrayLike<RecognitionResult> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface DictationSession {
  recognition: BrowserRecognition;
  draft: string;
  finishing: boolean;
  stream?: MediaStream;
  context?: AudioContext;
  levelTimer?: ReturnType<typeof setInterval>;
  finishTimer?: ReturnType<typeof setTimeout>;
}

@Component({
  selector: 'app-sample',
  imports: [SiChatInputComponent],
  templateUrl: './si-chat-voice-input-browser.html'
})
export class SampleComponent {
  private readonly logEvent = inject(LOG_EVENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly recognitionConstructor = window as unknown as Record<
    'SpeechRecognition' | 'webkitSpeechRecognition',
    (new () => BrowserRecognition) | undefined
  >;
  private readonly recognitionType =
    this.recognitionConstructor.SpeechRecognition ??
    this.recognitionConstructor.webkitSpeechRecognition;
  private session?: DictationSession;

  readonly supported = !!(
    this.recognitionType &&
    window.isSecureContext &&
    typeof navigator.mediaDevices?.getUserMedia === 'function' &&
    typeof window.AudioContext === 'function'
  );
  readonly value = signal('');
  readonly voiceInputState = signal<'idle' | 'listening' | 'recording' | 'finishing'>('idle');
  readonly voiceInputLevel = signal(0);
  readonly starting = signal(false);
  readonly error = signal<string | undefined>(undefined);

  constructor() {
    this.destroyRef.onDestroy(() => this.releaseSession());
  }

  async startDictation(): Promise<void> {
    if (!this.recognitionType || !this.supported || this.session) {
      return;
    }
    this.voiceInputState.set('listening');
    this.starting.set(true);
    this.error.set(undefined);
    this.voiceInputLevel.set(0);

    let session: DictationSession | undefined;
    try {
      const recognition = new this.recognitionType();
      session = { recognition, draft: this.value(), finishing: false };
      this.session = session;
      const current = session;
      recognition.lang = navigator.language || 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.onstart = () => {
        if (this.session === current) this.starting.set(false);
      };
      recognition.onspeechstart = () => {
        if (this.session === current && !current.finishing) {
          this.voiceInputState.set('recording');
        }
      };
      recognition.onresult = event => {
        if (this.session !== current) return;
        const transcript = Array.from(event.results, result => result[0].transcript).join('');
        this.value.set(current.draft ? `${current.draft} ${transcript}` : transcript);
        if (!current.finishing) this.voiceInputState.set('recording');
      };
      recognition.onerror = event => {
        if (this.session !== current) return;
        this.failDictation(
          event.error === 'not-allowed' || event.error === 'service-not-allowed'
            ? 'Microphone or speech recognition access was denied.'
            : event.error === 'no-speech'
              ? 'No speech was detected. Please try again.'
              : 'Speech recognition stopped unexpectedly. Check your connection and try again.'
        );
      };
      recognition.onend = () => {
        if (this.session !== current) return;
        this.releaseSession();
        this.logEvent('Dictation completed');
      };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (this.session !== current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      current.stream = stream;
      const context = new AudioContext();
      current.context = context;
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      context.createMediaStreamSource(stream).connect(analyser);
      await context.resume();
      if (this.session !== current) return;
      const samples = new Float32Array(analyser.fftSize);
      current.levelTimer = setInterval(() => {
        if (this.session !== current) return;
        analyser.getFloatTimeDomainData(samples);
        const power = samples.reduce((sum, sample) => sum + sample * sample, 0) / samples.length;
        this.voiceInputLevel.set(Math.min(1, Math.max(0, Math.sqrt(power) * 4 - 0.02)));
      }, 60);
      recognition.start();
      this.logEvent('Dictation started');
    } catch (error: unknown) {
      if (session && this.session !== session) return;
      this.failDictation(
        error instanceof DOMException && error.name === 'NotAllowedError'
          ? 'Microphone access was denied. Allow microphone access to use dictation.'
          : 'Voice input could not start. Check your microphone and try again.'
      );
    }
  }

  confirmDictation(): void {
    const session = this.session;
    if (!session || session.finishing) return;
    session.finishing = true;
    this.voiceInputState.set('finishing');
    this.stopAudio(session);
    session.finishTimer = setTimeout(() => {
      if (this.session !== session) return;
      this.releaseSession();
      this.error.set('Speech recognition did not finish in time. The current text was kept.');
    }, 5000);
    try {
      session.recognition.stop();
    } catch {
      this.releaseSession();
      this.error.set('Speech recognition could not finish. The current text was kept.');
    }
  }

  cancelDictation(): void {
    if (!this.session) return;
    this.value.set(this.session.draft);
    this.releaseSession();
    this.logEvent('Dictation cancelled');
  }

  sendMessage(event: { content: string; attachments: ChatInputAttachment[] }): void {
    this.logEvent(`Message sent: "${event.content}" with ${event.attachments.length} attachments`);
  }

  private failDictation(message: string): void {
    const hasTranscript = this.session && this.value() !== this.session.draft;
    this.releaseSession();
    this.error.set(
      hasTranscript ? `${message} Your text was kept and may be incomplete.` : message
    );
  }

  private stopAudio(session: DictationSession): void {
    clearInterval(session.levelTimer);
    session.stream?.getTracks().forEach(track => track.stop());
    session.stream = undefined;
    if (session.context) void session.context.close().catch(() => undefined);
    session.context = undefined;
    this.voiceInputLevel.set(0);
  }

  private releaseSession(): void {
    const session = this.session;
    this.session = undefined;
    if (session) {
      clearTimeout(session.finishTimer);
      this.stopAudio(session);
      const recognition = session.recognition;
      recognition.onstart = null;
      recognition.onspeechstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.abort();
      } catch {
        this.logEvent('Speech recognition was already stopped');
      }
    }
    if (!this.destroyRef.destroyed) {
      this.starting.set(false);
      this.voiceInputState.set('idle');
    }
  }
}
