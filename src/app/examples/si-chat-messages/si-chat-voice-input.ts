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
  private draft = '';

  readonly value = signal('');
  readonly voiceInputState = signal<'idle' | 'listening' | 'recording'>('idle');

  constructor() {
    this.destroyRef.onDestroy(() => this.stopTranscription());
  }

  startDictation(): void {
    this.draft = this.value();
    this.voiceInputState.set('listening');
    this.logEvent('Dictation started');

    const words = 'Show the energy consumption for the last seven days.'.split(' ');
    let wordCount = 0;
    this.transcriptionTimer = setInterval(() => {
      wordCount++;
      const transcript = words.slice(0, wordCount).join(' ');
      this.value.set(this.draft ? `${this.draft} ${transcript}` : transcript);
      this.voiceInputState.set('recording');
      if (wordCount === words.length) {
        this.stopTranscription();
      }
    }, 500);
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
    clearInterval(this.transcriptionTimer);
    this.transcriptionTimer = undefined;
  }
}
