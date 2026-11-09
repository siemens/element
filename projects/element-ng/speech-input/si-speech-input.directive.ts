/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  booleanAttribute,
  computed,
  Directive,
  effect,
  ElementRef,
  inject,
  Injector,
  InjectionToken,
  input,
  model,
  OnDestroy,
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

/** A Web Speech API recognition result event. @experimental */
export interface SpeechInputResultEvent {
  /** Results for the current recognition session, including interim results. */
  results: ArrayLike<{
    readonly isFinal: boolean;
    readonly [index: number]: { readonly transcript: string };
  }>;
}

/** Browser or application-provided Web Speech API adapter. @experimental */
export interface SpeechInputRecognition {
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
  onresult: ((event: SpeechInputResultEvent) => void) | null;
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
export const SI_SPEECH_INPUT_RECOGNITION = new InjectionToken<
  (() => SpeechInputRecognition) | undefined
>('si-speech-input-recognition', {
  providedIn: 'root',
  factory: () => {
    const window = inject(DOCUMENT).defaultView as
      | (Window &
          Partial<
            Record<
              'SpeechRecognition' | 'webkitSpeechRecognition',
              new () => SpeechInputRecognition
            >
          >)
      | null;
    const recognitionConstructor = window?.SpeechRecognition ?? window?.webkitSpeechRecognition;
    return recognitionConstructor ? () => new recognitionConstructor() : undefined;
  }
});

/**
 * Adds speech recognition to a consumer-owned button, inside or outside chat input.
 * Browser recognition may transmit audio to the browser vendor's service.
 * @experimental
 */
@Directive({
  selector: 'button[siSpeechInput]',
  host: {
    '[disabled]': 'disabled() || !supported()',
    '[attr.aria-disabled]': '!supported() || disabled()',
    '[attr.aria-pressed]': 'listening()',
    '[attr.aria-label]': 'buttonLabel()',
    '(click)': 'onClick($event)',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointerup)': 'onPointerUp($event)',
    '(pointercancel)': 'onPointerUp($event)',
    '(lostpointercapture)': 'onPointerUp($event)',
    '(keydown)': 'onKeyDown($event)',
    '(keyup)': 'onKeyUp($event)',
    '(blur)': 'onBlur()'
  },
  exportAs: 'siSpeechInput'
})
export class SiSpeechInputDirective implements OnDestroy {
  private readonly factory = inject(SI_SPEECH_INPUT_RECOGNITION);
  private readonly element = inject<ElementRef<HTMLButtonElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly translate = injectSiTranslateService();
  private readonly listeningState = signal(false);
  private readonly denied = signal(false);
  private readonly reason = signal<'completed' | 'cancelled' | 'error' | undefined>(undefined);
  private recognition?: SpeechInputRecognition;
  private silenceTimer?: ReturnType<typeof setTimeout>;
  private savedDraft = '';
  private started = false;
  private stopping = false;
  private held = false;
  private speaking = false;
  private attempt = 0;
  private destroyed = false;
  private permissionHint?: HTMLElement;

  /** Complete draft, updated with partial and final transcripts. @defaultValue '' */
  readonly value = model('');
  /** Disable recognition without disabling surrounding controls. @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Recognition interaction. @defaultValue 'toggle' */
  readonly mode = input<'toggle' | 'push-to-talk'>('toggle');
  /** Keep recognizing after an utterance. @defaultValue false */
  readonly continuous = input(false, { transform: booleanAttribute });
  /** Stop after this many milliseconds of silence; zero disables it. @defaultValue 0 */
  readonly silenceTimeout = input(0);
  /** BCP 47 recognition language; empty uses the browser default. @defaultValue '' */
  readonly lang = input('');
  /** Show a recovery popover when microphone permission is denied. @defaultValue false */
  readonly noPermissionHint = input(false, { transform: booleanAttribute });
  /**
   * Start button's accessible label.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_SPEECH_INPUT.START:Start dictation`)
   * ```
   */
  readonly startLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_SPEECH_INPUT.START:Start dictation`)
  );
  /**
   * Stop button's accessible label.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_SPEECH_INPUT.STOP:Stop dictation`)
   * ```
   */
  readonly stopLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_SPEECH_INPUT.STOP:Stop dictation`)
  );
  /**
   * Permission recovery message.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_SPEECH_INPUT.NO_PERMISSION:Microphone access is blocked. To use voice input, allow the microphone for this site in your browser settings, then try again.`)
   * ```
   */
  readonly noPermissionLabel = input<TranslatableString>(
    t(
      () =>
        $localize`:@@SI_SPEECH_INPUT.NO_PERMISSION:Microphone access is blocked. To use voice input, allow the microphone for this site in your browser settings, then try again.`
    )
  );
  /** Whether a recognition adapter is available. */
  readonly supported = signal(!!this.factory).asReadonly();
  /** Includes permission startup and final result collection. */
  readonly listening = this.listeningState.asReadonly();
  /** Whether the current attempt was denied microphone permission. */
  readonly permissionDenied = this.denied.asReadonly();
  /** Reason for the last false listeningChange; reset when a new attempt starts. */
  readonly completionReason = this.reason.asReadonly();
  /** Complete transcript for the current attempt, without the previous draft. */
  readonly transcript = output<string>();
  /** Emitted at startup and, after draft bindings render, at completion or cancellation. */
  readonly listeningChange = output<boolean>();
  /** Web Speech API error code, or unsupported/start-failed/stop-failed. */
  readonly errorOccurred = output<string>();
  protected readonly buttonLabel = toSignal(
    toObservable(computed(() => (this.listening() ? this.stopLabel() : this.startLabel()))).pipe(
      switchMap(label => this.translate.translateAsync(label))
    ),
    { initialValue: '' }
  );
  private readonly permissionLabel = toSignal(
    toObservable(this.noPermissionLabel).pipe(
      switchMap(label => this.translate.translateAsync(label))
    ),
    { initialValue: '' }
  );

  constructor() {
    effect(() => {
      if (this.disabled()) {
        this.cancel();
      }
    });
  }

  /** Start a session. Repeated starts while active are ignored. */
  start(): void {
    if (this.destroyed || this.disabled() || this.listening()) {
      return;
    }
    this.hidePermissionHint();
    this.denied.set(false);
    this.reason.set(undefined);
    if (!this.factory) {
      this.errorOccurred.emit('unsupported');
      return;
    }
    this.savedDraft = this.value();
    const attempt = ++this.attempt;
    this.started = false;
    this.stopping = false;
    this.speaking = false;
    this.listeningState.set(true);
    this.listeningChange.emit(true);
    if (this.attempt !== attempt || !this.listening()) {
      return;
    }
    try {
      const recognition = this.factory();
      this.recognition = recognition;
      recognition.continuous = this.continuous();
      recognition.interimResults = true;
      recognition.lang = this.lang();
      recognition.onstart = () => {
        if (this.attempt !== attempt || this.recognition !== recognition) {
          return;
        }
        this.started = true;
        if (this.stopping) {
          this.stopRecognition();
        } else {
          this.scheduleStop();
        }
      };
      recognition.onresult = event => {
        if (this.attempt !== attempt || this.recognition !== recognition) {
          return;
        }
        const transcript = Array.from(event.results, result => result[0].transcript.trim())
          .filter(Boolean)
          .join(' ');
        this.value.set(
          transcript
            ? this.savedDraft
              ? `${this.savedDraft.trimEnd()} ${transcript}`
              : transcript
            : this.savedDraft
        );
        this.transcript.emit(transcript);
        this.scheduleStop();
      };
      recognition.onspeechstart = () => {
        if (this.attempt === attempt && this.recognition === recognition) {
          this.speaking = true;
          this.clearSilenceTimer();
        }
      };
      recognition.onspeechend = () => {
        if (this.attempt === attempt && this.recognition === recognition) {
          this.speaking = false;
          this.scheduleStop();
        }
      };
      recognition.onerror = event => {
        if (this.attempt === attempt && this.recognition === recognition) {
          this.fail(event.error);
        }
      };
      recognition.onend = () => {
        if (this.attempt === attempt && this.recognition === recognition) {
          this.finish();
        }
      };
      recognition.start();
    } catch {
      this.fail('start-failed');
    }
  }

  /** Stop and retain final transcripts. listening becomes false only after recognition ends. */
  stop(): void {
    if (!this.listening() || this.stopping) {
      return;
    }
    this.stopping = true;
    this.clearSilenceTimer();
    if (this.started) {
      this.stopRecognition();
    }
  }

  /** Abort the attempt and restore the pre-recognition draft. */
  cancel(): void {
    if (!this.listening()) {
      return;
    }
    const recognition = this.recognition;
    this.detach();
    this.value.set(this.savedDraft);
    try {
      this.abortRecognition(recognition);
    } finally {
      this.finish('cancelled');
    }
  }

  protected onClick(event: MouseEvent): void {
    if (this.mode() === 'push-to-talk' && event.detail > 0) {
      return;
    }
    if (this.listening()) {
      this.stop();
    } else {
      this.start();
    }
  }

  protected onPointerDown(event: PointerEvent): void {
    if (this.mode() !== 'push-to-talk' || event.button !== 0 || this.disabled()) {
      return;
    }
    this.held = true;
    this.element.setPointerCapture(event.pointerId);
    this.start();
  }

  protected onPointerUp(event: PointerEvent): void {
    if (!this.held || event.button > 0) {
      return;
    }
    this.held = false;
    this.stop();
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.listening()) {
      event.preventDefault();
      this.cancel();
      return;
    }
    if (this.mode() === 'push-to-talk' && (event.key === ' ' || event.key === 'Enter')) {
      event.preventDefault();
      if (!event.repeat) {
        this.held = true;
        this.start();
      }
    }
  }

  protected onKeyUp(event: KeyboardEvent): void {
    if (this.mode() === 'push-to-talk' && (event.key === ' ' || event.key === 'Enter')) {
      event.preventDefault();
      this.onBlur();
    }
  }

  protected onBlur(): void {
    if (this.held) {
      this.held = false;
      this.stop();
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    const recognition = this.recognition;
    this.detach();
    this.abortRecognition(recognition);
    this.hidePermissionHint();
  }

  private stopRecognition(): void {
    try {
      this.recognition?.stop();
    } catch {
      this.fail('stop-failed');
    }
  }

  private scheduleStop(): void {
    this.clearSilenceTimer();
    if (!this.stopping && !this.speaking && this.silenceTimeout() > 0) {
      this.silenceTimer = setTimeout(() => this.stop(), this.silenceTimeout());
    }
  }

  private clearSilenceTimer(): void {
    clearTimeout(this.silenceTimer);
    this.silenceTimer = undefined;
  }

  private detach(): void {
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
  }

  private finish(reason: 'completed' | 'cancelled' | 'error' = 'completed'): void {
    this.detach();
    this.started = false;
    this.stopping = false;
    this.reason.set(reason);
    this.listeningState.set(false);
    const attempt = this.attempt;
    afterNextRender(
      () => {
        if (!this.destroyed && this.attempt === attempt) {
          this.listeningChange.emit(false);
        }
      },
      { injector: this.injector }
    );
  }

  private fail(error: string): void {
    const recognition = this.recognition;
    this.detach();
    this.value.set(this.savedDraft);
    this.denied.set(error === 'not-allowed' || error === 'service-not-allowed');
    this.abortRecognition(recognition);
    this.errorOccurred.emit(error);
    this.finish('error');
    if (this.denied() && this.noPermissionHint()) {
      this.showPermissionHint();
    }
  }

  private showPermissionHint(): void {
    this.hidePermissionHint();
    const hint = this.document.createElement('div');
    hint.className = 'popover p-4 shadow';
    hint.setAttribute('popover', 'auto');
    hint.setAttribute('role', 'alert');
    hint.tabIndex = -1;
    hint.textContent = this.permissionLabel();
    hint.style.maxWidth = 'min(320px, calc(100vw - 32px))';
    this.document.body.appendChild(hint);
    this.permissionHint = hint;
    hint.showPopover();
    hint.focus();
  }

  private hidePermissionHint(): void {
    if (this.permissionHint === this.document.activeElement && this.element.isConnected) {
      this.element.focus();
    }
    this.permissionHint?.remove();
    this.permissionHint = undefined;
  }

  private abortRecognition(recognition: SpeechInputRecognition | undefined): void {
    try {
      recognition?.abort();
    } catch {
      this.errorOccurred.emit('abort-failed');
    }
  }
}
