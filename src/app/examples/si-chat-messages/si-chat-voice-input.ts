/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, signal } from '@angular/core';
import { elementVoice, elementStopFilled } from '@siemens/element-icons';
import { ChatInputAttachment, SiChatInputComponent } from '@siemens/element-ng/chat-messages';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import {
  SI_SPEECH_INPUT_RECOGNITION,
  SiSpeechInputDirective,
  SpeechInputRecognition,
  SpeechInputResultEvent
} from '@siemens/element-ng/speech-input';
import { SiTooltipDirective } from '@siemens/element-ng/tooltip';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiChatInputComponent, SiSpeechInputDirective, SiIconComponent, SiTooltipDirective],
  templateUrl: './si-chat-voice-input.html',
  providers: [
    {
      provide: SI_SPEECH_INPUT_RECOGNITION,
      useFactory: () => () => new SimulatedRecognition()
    }
  ]
})
export class SampleComponent {
  private readonly logEvent = inject(LOG_EVENT);
  readonly icons = addIcons({ elementVoice, elementStopFilled });
  readonly value = signal('');
  readonly listening = signal(false);
  readonly autoSend = signal(false);
  readonly mode = signal<'toggle' | 'push-to-talk'>('toggle');
  readonly error = signal<string | undefined>(undefined);

  onListeningChange(
    listening: boolean,
    chat: SiChatInputComponent,
    speech: SiSpeechInputDirective
  ): void {
    this.listening.set(listening);
    if (listening) {
      this.error.set(undefined);
    } else if (
      this.autoSend() &&
      speech.completionReason() === 'completed' &&
      !this.error() &&
      this.value().trim()
    ) {
      chat.sendCurrent();
    }
    this.logEvent(listening ? 'Dictation started' : 'Dictation ended');
  }

  onSpeechError(error: string): void {
    this.error.set(`Voice input failed: ${error}`);
    this.logEvent(`Voice input failed: ${error}`);
  }

  setMode(event: Event): void {
    const mode = (event.target as HTMLSelectElement).value;
    if (mode === 'toggle' || mode === 'push-to-talk') {
      this.mode.set(mode);
    }
  }

  sendMessage(event: { content: string; attachments: ChatInputAttachment[] }): void {
    this.logEvent(`Message sent: "${event.content}" with ${event.attachments.length} attachments`);
  }
}

class SimulatedRecognition implements SpeechInputRecognition {
  continuous = false;
  interimResults = true;
  lang = '';
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onresult: ((event: SpeechInputResultEvent) => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
  onspeechstart: (() => void) | null = null;
  onspeechend: (() => void) | null = null;
  private startupTimer?: ReturnType<typeof setTimeout>;
  private transcriptionTimer?: ReturnType<typeof setInterval>;
  private transcript = '';
  private active = false;

  start(): void {
    this.active = true;
    this.startupTimer = setTimeout(() => {
      this.onstart?.();
      if (!this.active) {
        return;
      }
      this.onspeechstart?.();
      const words = 'Show the energy consumption for the last seven days.'.split(' ');
      let wordCount = 0;
      this.transcriptionTimer = setInterval(() => {
        this.transcript = words.slice(0, ++wordCount).join(' ');
        this.emitResult(wordCount === words.length);
        if (wordCount === words.length) {
          clearInterval(this.transcriptionTimer);
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
    clearTimeout(this.startupTimer);
    clearInterval(this.transcriptionTimer);
  }

  private emitResult(isFinal: boolean): void {
    this.onresult?.({ results: [{ isFinal, 0: { transcript: this.transcript } }] });
  }
}
