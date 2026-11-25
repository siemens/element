/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { elementStopFilled, elementVoice } from '@siemens/element-icons';
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
    SiVoiceWaveformComponent,
    SiIconComponent,
    SiTooltipDirective
  ],
  templateUrl: './si-chat-voice-input-browser.html'
})
export class SampleComponent {
  private readonly logEvent = inject(LOG_EVENT);
  private readonly destroyRef = inject(DestroyRef);
  private stream?: MediaStream;
  private audioContext?: AudioContext;
  private levelTimer?: ReturnType<typeof setInterval>;
  private meterSession = 0;

  readonly icons = addIcons({ elementVoice, elementStopFilled });
  readonly value = signal('');
  readonly listening = signal(false);
  readonly audioLevel = signal<number | undefined>(undefined);
  readonly error = signal<string | undefined>(undefined);

  constructor() {
    this.destroyRef.onDestroy(() => this.stopMeter());
  }

  onListeningChange(listening: boolean): void {
    this.listening.set(listening);
    if (listening) {
      this.error.set(undefined);
      void this.startMeter();
    } else {
      this.stopMeter();
    }
    this.logEvent(listening ? 'Dictation started' : 'Dictation ended');
  }

  onVoiceInputError(error: VoiceInputError): void {
    const message =
      error === 'not-allowed' || error === 'service-not-allowed'
        ? 'Microphone access is blocked. Allow microphone access in your browser settings, then try again.'
        : `Voice input failed: ${error}`;
    this.error.set(message);
    this.logEvent(`Voice input failed: ${error}`);
  }

  sendMessage(event: { content: string; attachments: ChatInputAttachment[] }): void {
    this.logEvent(`Message sent: "${event.content}" with ${event.attachments.length} attachments`);
  }

  private async startMeter(): Promise<void> {
    if (
      typeof navigator.mediaDevices?.getUserMedia !== 'function' ||
      typeof AudioContext !== 'function'
    ) {
      return;
    }

    const session = ++this.meterSession;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (this.meterSession !== session || this.destroyRef.destroyed) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      const context = new AudioContext();
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      context.createMediaStreamSource(stream).connect(analyser);
      await context.resume();
      if (this.meterSession !== session || this.destroyRef.destroyed) {
        stream.getTracks().forEach(track => track.stop());
        void context.close().catch(() => undefined);
        return;
      }

      this.stream = stream;
      this.audioContext = context;
      this.audioLevel.set(0);

      const samples = new Float32Array(analyser.fftSize);
      this.levelTimer = setInterval(() => {
        analyser.getFloatTimeDomainData(samples);
        const rms = Math.sqrt(
          samples.reduce((sum, sample) => sum + sample * sample, 0) / samples.length
        );
        this.audioLevel.set(Math.min(1, Math.max(0, rms * 4 - 0.02)));
      }, 60);
    } catch {
      if (this.meterSession === session) {
        // Leave audioLevel undefined so the waveform falls back to simulated activity.
        this.audioLevel.set(undefined);
      }
    }
  }

  private stopMeter(): void {
    this.meterSession++;
    clearInterval(this.levelTimer);
    this.levelTimer = undefined;
    this.stream?.getTracks().forEach(track => track.stop());
    this.stream = undefined;
    if (this.audioContext) {
      void this.audioContext.close().catch(() => undefined);
      this.audioContext = undefined;
    }
    if (!this.destroyRef.destroyed) {
      this.audioLevel.set(undefined);
    }
  }
}
