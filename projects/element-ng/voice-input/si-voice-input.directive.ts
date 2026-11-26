/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { DOCUMENT } from '@angular/common';
import {
  booleanAttribute,
  computed,
  DestroyRef,
  Directive,
  effect,
  inject,
  InjectionToken,
  input,
  model,
  output,
  signal
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  injectSiTranslateService,
  TranslatableString,
  t
} from '@siemens/element-translate-ng/translate';
import { switchMap } from 'rxjs';

/**
 * Web Speech API error codes and directive lifecycle error codes.
 * @experimental
 */
export type VoiceInputError =
  | 'no-speech'
  | 'aborted'
  | 'audio-capture'
  | 'network'
  | 'not-allowed'
  | 'service-not-allowed'
  | 'bad-grammar'
  | 'language-not-supported'
  | 'unsupported'
  | 'start-failed'
  | 'stop-failed'
  | 'abort-failed'
  | 'unknown';

const VOICE_INPUT_ERRORS: Record<VoiceInputError, true> = {
  'no-speech': true,
  aborted: true,
  'audio-capture': true,
  network: true,
  'not-allowed': true,
  'service-not-allowed': true,
  'bad-grammar': true,
  'language-not-supported': true,
  unsupported: true,
  'start-failed': true,
  'stop-failed': true,
  'abort-failed': true,
  unknown: true
};

const toVoiceInputError = (error: string): VoiceInputError =>
  Object.hasOwn(VOICE_INPUT_ERRORS, error) ? (error as VoiceInputError) : 'unknown';

/** A Web Speech API recognition result event. @experimental */
export interface VoiceInputResultEvent {
  /** Results for the current recognition session, including interim results. */
  results: ArrayLike<{
    readonly isFinal: boolean;
    readonly [index: number]: { readonly transcript: string };
  }>;
}

/** Browser or application-provided Web Speech API adapter. @experimental */
export interface VoiceInputRecognition {
  /** Whether recognition continues after an utterance. */
  continuous: boolean;
  /** Whether partial results are returned. */
  interimResults: boolean;
  /** Recognition language as a BCP 47 tag. */
  lang: string;
  /** Called when recognition starts. */
  onstart: (() => void) | null;
  /** Called when recognition has finished delivering results. */
  onend: (() => void) | null;
  /** Called for partial and final recognition results. */
  onresult: ((event: VoiceInputResultEvent) => void) | null;
  /** Called when recognition fails. */
  onerror: ((event: { error: string }) => void) | null;
  /** Called when speech activity is detected. */
  onspeechstart: (() => void) | null;
  /** Called when an utterance ends. */
  onspeechend: (() => void) | null;
  /** Request recognition and microphone permission. */
  start(): void;
  /** Stop recognition, allowing final results to arrive. */
  stop(): void;
  /** Abort recognition without waiting for final results. */
  abort(): void;
}

/**
 * Factory for recognition instances. Override to use another provider or a test adapter.
 * The default uses SpeechRecognition or webkitSpeechRecognition when available.
 * @experimental
 */
export const SI_VOICE_INPUT_RECOGNITION = new InjectionToken<
  (() => VoiceInputRecognition) | undefined
>('si-voice-input-recognition', {
  providedIn: 'root',
  factory: () => {
    const window = inject(DOCUMENT).defaultView as
      | (Window &
          Partial<
            Record<'SpeechRecognition' | 'webkitSpeechRecognition', new () => VoiceInputRecognition>
          >)
      | null;
    const recognitionConstructor = window?.SpeechRecognition ?? window?.webkitSpeechRecognition;
    return recognitionConstructor ? () => new recognitionConstructor() : undefined;
  }
});

/**
 * Adds voice input recognition to a button.
 * Browser recognition may transmit audio to the browser vendor's service.
 * @experimental
 */
@Directive({
  selector: 'button[siVoiceInput]',
  host: {
    '[disabled]': 'disabled() || !supported',
    '[attr.aria-pressed]': 'listening()',
    '[attr.aria-label]': 'buttonLabel()',
    '(click)': 'onClick()',
    '(keydown.escape)': 'onEscape($event)'
  },
  exportAs: 'siVoiceInput'
})
export class SiVoiceInputDirective {
  private readonly createRecognition = inject(SI_VOICE_INPUT_RECOGNITION);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = injectSiTranslateService();
  private readonly phase = signal<
    'idle' | 'starting' | 'stop-pending' | 'listening' | 'speaking' | 'stopping'
  >('idle');
  private recognition?: VoiceInputRecognition;
  private silenceTimer?: ReturnType<typeof setTimeout>;
  private savedDraft = '';
  private attemptTranscript = '';
  /** Monotonic session counter incremented on start and detach to ignore stale callbacks and re-entrant restarts. */
  private attempt = 0;

  /** Draft text updated with partial and final transcripts. @defaultValue '' */
  readonly value = model('');
  /** Disables the button and cancels any active recognition. @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Keeps recognizing after an utterance ends. @defaultValue false */
  readonly continuous = input(false, { transform: booleanAttribute });
  /** Stops recognition after this many milliseconds of silence; `0` disables it. @defaultValue 0 */
  readonly silenceTimeout = input(0);
  /** BCP 47 recognition language; empty uses the browser default. @defaultValue '' */
  readonly lang = input('');
  /**
   * Accessible label while idle.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_VOICE_INPUT.START:Start dictation`)
   * ```
   */
  readonly startLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_VOICE_INPUT.START:Start dictation`)
  );
  /**
   * Accessible label while listening.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_VOICE_INPUT.STOP:Stop dictation`)
   * ```
   */
  readonly stopLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_VOICE_INPUT.STOP:Stop dictation`)
  );
  /** Whether a recognition adapter is available in the current environment. */
  readonly supported = !!this.createRecognition;
  /** Whether recognition is active, including startup and finalization. */
  readonly listening = computed(() => this.phase() !== 'idle');
  /** Latest transcript for the active attempt, excluding the previous draft. */
  readonly transcript = output<string>();
  /** Emitted when recognition starts (`true`) or ends (`false`). */
  readonly listeningChange = output<boolean>();
  /** Emitted with the recognized transcript when an attempt completes normally. */
  readonly completed = output<string>();
  /** Emitted when recognition fails or cannot be controlled. */
  readonly errorOccurred = output<VoiceInputError>();

  protected readonly buttonLabel = toSignal(
    toObservable(computed(() => (this.listening() ? this.stopLabel() : this.startLabel()))).pipe(
      switchMap(label => this.translate.translateAsync(label))
    ),
    { initialValue: '' }
  );

  constructor() {
    this.destroyRef.onDestroy(() => this.endRecognition(this.detach(), 'abort'));
    effect(() => {
      if (this.disabled()) {
        this.cancel();
      }
    });
  }

  /** Starts a recognition session. Ignored if already active or disabled. */
  start(): void {
    if (this.destroyRef.destroyed || this.disabled() || this.listening()) {
      return;
    }
    if (!this.createRecognition) {
      this.errorOccurred.emit('unsupported');
      return;
    }
    this.savedDraft = this.value();
    this.attemptTranscript = '';
    const attempt = ++this.attempt;
    this.phase.set('starting');
    this.listeningChange.emit(true);
    // listeningChange runs synchronously; a listener may cancel (phase -> idle) or cancel and restart (incrementing this.attempt).
    if (this.attempt !== attempt || !this.listening()) {
      return;
    }
    try {
      const recognition = this.createRecognition();
      this.recognition = recognition;
      const isCurrentAttempt = (): boolean =>
        this.attempt === attempt && this.recognition === recognition;
      recognition.continuous = this.continuous();
      recognition.interimResults = true;
      recognition.lang = this.lang();
      recognition.onstart = () => {
        if (!isCurrentAttempt()) {
          return;
        }
        if (this.phase() === 'stop-pending') {
          this.phase.set('stopping');
          this.endRecognition(recognition, 'stop');
        } else if (this.phase() === 'starting') {
          this.phase.set('listening');
          this.resetSilenceTimer();
        }
      };
      recognition.onresult = event => {
        if (!isCurrentAttempt()) {
          return;
        }
        const transcript = Array.from(event.results, result => result[0].transcript.trim())
          .filter(Boolean)
          .join(' ');
        this.attemptTranscript = transcript;
        this.value.set(
          transcript
            ? this.savedDraft
              ? `${this.savedDraft.trimEnd()} ${transcript}`
              : transcript
            : this.savedDraft
        );
        this.transcript.emit(transcript);
        if (isCurrentAttempt()) {
          this.resetSilenceTimer();
        }
      };
      recognition.onspeechstart = () => {
        if (isCurrentAttempt() && this.phase() === 'listening') {
          this.phase.set('speaking');
          this.clearSilenceTimer();
        }
      };
      recognition.onspeechend = () => {
        if (isCurrentAttempt() && this.phase() === 'speaking') {
          this.phase.set('listening');
          this.resetSilenceTimer();
        }
      };
      recognition.onerror = event => {
        if (isCurrentAttempt()) {
          this.fail(toVoiceInputError(event.error));
        }
      };
      recognition.onend = () => {
        if (isCurrentAttempt()) {
          this.detach();
          this.finish(this.attemptTranscript);
        }
      };
      recognition.start();
    } catch {
      this.fail('start-failed');
    }
  }

  /** Stops recognition and retains final transcripts once the provider finishes. */
  stop(): void {
    switch (this.phase()) {
      case 'starting':
        this.phase.set('stop-pending');
        break;
      case 'listening':
      case 'speaking':
        this.phase.set('stopping');
        this.clearSilenceTimer();
        this.endRecognition(this.recognition, 'stop');
        break;
    }
  }

  /** Aborts the attempt and restores the pre-recognition draft. */
  cancel(): void {
    if (!this.listening()) {
      return;
    }
    const recognition = this.detach();
    this.value.set(this.savedDraft);
    try {
      this.endRecognition(recognition, 'abort');
    } finally {
      this.finish();
    }
  }

  protected onClick(): void {
    if (this.listening()) {
      this.stop();
    } else {
      this.start();
    }
  }

  protected onEscape(event: Event): void {
    if (this.listening()) {
      event.preventDefault();
      this.cancel();
    }
  }

  private endRecognition(
    recognition: VoiceInputRecognition | undefined,
    action: 'stop' | 'abort'
  ): void {
    try {
      recognition?.[action]();
    } catch {
      if (action === 'stop') {
        this.fail('stop-failed');
      } else if (!this.destroyRef.destroyed) {
        this.errorOccurred.emit('abort-failed');
      }
    }
  }

  /** Restarts the silence timeout that stops recognition when no speech arrives while listening. */
  private resetSilenceTimer(): void {
    this.clearSilenceTimer();
    if (this.phase() === 'listening' && this.silenceTimeout() > 0) {
      this.silenceTimer = setTimeout(() => this.stop(), this.silenceTimeout());
    }
  }

  /** Cancels any pending silence timeout. */
  private clearSilenceTimer(): void {
    clearTimeout(this.silenceTimer);
    this.silenceTimer = undefined;
  }

  private detach(): VoiceInputRecognition | undefined {
    this.attempt++;
    this.clearSilenceTimer();
    const recognition = this.recognition;
    this.recognition = undefined;
    if (recognition) {
      recognition.onstart = null;
      recognition.onend = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onspeechstart = null;
      recognition.onspeechend = null;
    }
    return recognition;
  }

  private finish(completedTranscript?: string): void {
    const attempt = this.attempt;
    this.phase.set('idle');
    this.listeningChange.emit(false);
    // Skip completed if a synchronous listeningChange listener already started a new attempt.
    if (completedTranscript !== undefined && this.attempt === attempt) {
      this.completed.emit(completedTranscript);
    }
  }

  private fail(error: VoiceInputError): void {
    const recognition = this.detach();
    this.endRecognition(recognition, 'abort');
    this.errorOccurred.emit(error);
    this.finish();
  }
}
