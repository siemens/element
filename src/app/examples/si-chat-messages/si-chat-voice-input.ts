/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, signal } from '@angular/core';
import { elementVoice, elementStopFilled } from '@siemens/element-icons';
import {
  ChatInputAttachment,
  SiChatInputComponent,
  SiVoiceWaveformComponent
} from '@siemens/element-ng/chat-messages';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiSpeechInputDirective } from '@siemens/element-ng/speech-input';
import { SiTooltipDirective } from '@siemens/element-ng/tooltip';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [
    SiChatInputComponent,
    SiSpeechInputDirective,
    SiIconComponent,
    SiTooltipDirective,
    SiVoiceWaveformComponent
  ],
  templateUrl: './si-chat-voice-input.html'
})
export class SampleComponent {
  private readonly logEvent = inject(LOG_EVENT);
  readonly icons = addIcons({ elementVoice, elementStopFilled });
  readonly value = signal('');
  readonly listening = signal(false);
  readonly hasTranscript = signal(false);
  readonly measuredLevels = signal(false);
  readonly voiceInputLevel = signal<number | undefined>(undefined);
  readonly error = signal<string | undefined>(undefined);

  onListeningChange(listening: boolean): void {
    this.listening.set(listening);
    if (listening) {
      this.error.set(undefined);
      this.hasTranscript.set(false);
      this.voiceInputLevel.set(this.measuredLevels() ? 0 : undefined);
    }
    this.logEvent(listening ? 'Dictation started' : 'Dictation ended');
  }

  onTranscript(transcript: string): void {
    this.hasTranscript.set(!!transcript);
    if (this.measuredLevels()) {
      this.voiceInputLevel.set((transcript.split(' ').length % 4) / 3);
    }
  }

  onSpeechError(error: string): void {
    this.error.set(`Voice input failed: ${error}`);
    this.logEvent(`Voice input failed: ${error}`);
  }

  sendMessage(event: { content: string; attachments: ChatInputAttachment[] }): void {
    this.logEvent(`Message sent: "${event.content}" with ${event.attachments.length} attachments`);
  }
}
