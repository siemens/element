/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ChatInputAttachment, SiChatInputComponent } from '@siemens/element-ng/chat-messages';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiChatInputComponent],
  templateUrl: './si-chat-voice-input.html'
})
export class SampleComponent {
  private readonly logEvent = inject(LOG_EVENT);
  private readonly destroyRef = inject(DestroyRef);
  private transcriptionTimer?: ReturnType<typeof setInterval>;
  private dictationAttempt = 0;
  private draft = '';

  readonly value = signal('');
  readonly voiceInputState = signal<'idle' | 'listening' | 'recording'>('idle');
  readonly automaticCompletion = signal(true);
  readonly starting = signal(false);
  readonly error = signal<string | undefined>(undefined);

  constructor() {
    this.destroyRef.onDestroy(() => this.stopTranscription());
  }

  async startDictation(): Promise<void> {
    if (this.voiceInputState() !== 'idle') {
      return;
    }
    const attempt = ++this.dictationAttempt;
    this.draft = this.value();
    this.voiceInputState.set('listening');
    this.starting.set(true);
    this.error.set(undefined);

    try {
      await new Promise<void>(resolve => setTimeout(resolve, 750));
      if (attempt !== this.dictationAttempt || this.destroyRef.destroyed) {
        return;
      }
      this.starting.set(false);
      const words = 'Show the energy consumption for the last seven days.'.split(' ');
      let wordCount = 0;
      this.transcriptionTimer = setInterval(() => {
        if (attempt !== this.dictationAttempt) {
          return;
        }
        wordCount++;
        const transcript = words.slice(0, wordCount).join(' ');
        this.value.set(this.draft ? `${this.draft} ${transcript}` : transcript);
        this.voiceInputState.set('recording');
        if (wordCount === words.length) {
          this.stopTranscription();
          if (this.automaticCompletion()) {
            this.voiceInputState.set('idle');
            this.logEvent('Dictation completed');
          }
        }
      }, 500);
      this.logEvent('Dictation started');
    } catch {
      if (attempt !== this.dictationAttempt || this.destroyRef.destroyed) {
        return;
      }
      this.cancelDictation();
      this.error.set('Voice input could not start. Please try again.');
      this.logEvent('Voice input could not start');
    }
  }

  confirmDictation(): void {
    this.stopTranscription();
    this.voiceInputState.set('idle');
    this.logEvent('Dictation confirmed');
  }

  cancelDictation(): void {
    this.stopTranscription();
    this.value.set(this.draft);
    this.voiceInputState.set('idle');
    this.logEvent('Dictation cancelled');
  }

  sendMessage(event: { content: string; attachments: ChatInputAttachment[] }): void {
    this.logEvent(`Message sent: "${event.content}" with ${event.attachments.length} attachments`);
  }

  private stopTranscription(): void {
    this.dictationAttempt++;
    this.starting.set(false);
    clearInterval(this.transcriptionTimer);
    this.transcriptionTimer = undefined;
  }
}
