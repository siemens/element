/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { afterNextRender, Component, computed, inject, Injector, signal } from '@angular/core';
import { elementVoice, elementStopFilled } from '@siemens/element-icons';
import { ChatInputAttachment, SiChatInputComponent } from '@siemens/element-ng/chat-messages';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiTooltipDirective } from '@siemens/element-ng/tooltip';
import {
  SiVoiceInputDirective,
  SiVoiceWaveformComponent,
  VoiceInputError
} from '@siemens/element-ng/voice-input';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [
    SiChatInputComponent,
    SiVoiceInputDirective,
    SiIconComponent,
    SiTooltipDirective,
    SiVoiceWaveformComponent
  ],
  templateUrl: './si-chat-voice-input.html'
})
export class SampleComponent {
  private readonly logEvent = inject(LOG_EVENT);
  private readonly injector = inject(Injector);
  readonly icons = addIcons({ elementVoice, elementStopFilled });
  readonly value = signal('');
  readonly language = signal('');
  readonly listening = signal(false);
  readonly autoSend = signal(false);
  readonly mode = signal<'toggle' | 'push-to-talk'>('toggle');
  readonly useCustomLevels = signal(false);
  readonly voiceInputLevel = signal<number | undefined>(undefined);
  readonly error = signal<string | undefined>(undefined);
  readonly tooltip = computed(() => {
    if (this.mode() === 'push-to-talk') {
      return this.listening() ? 'Release to stop' : 'Hold to dictate';
    }
    return this.listening() ? 'Stop dictation' : 'Start dictation';
  });

  onListeningChange(listening: boolean): void {
    this.listening.set(listening);
    if (listening) {
      this.error.set(undefined);
      this.voiceInputLevel.set(this.useCustomLevels() ? 0 : undefined);
    }
    this.logEvent(listening ? 'Dictation started' : 'Dictation ended');
  }

  onDictationCompleted(transcript: string, chat: SiChatInputComponent): void {
    if (this.autoSend() && transcript) {
      // Wait for [disabled]="voiceInput.listening()" to clear before submitting.
      afterNextRender(() => chat.submit(), { injector: this.injector });
    }
  }

  onTranscript(transcript: string): void {
    if (this.useCustomLevels()) {
      this.voiceInputLevel.set((transcript.split(' ').length % 4) / 3);
    }
  }

  onVoiceInputError(error: VoiceInputError): void {
    const message =
      error === 'not-allowed' || error === 'service-not-allowed'
        ? 'Microphone access is blocked. Allow microphone access in your browser settings, then try again.'
        : `Voice input failed: ${error}`;
    this.error.set(message);
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
