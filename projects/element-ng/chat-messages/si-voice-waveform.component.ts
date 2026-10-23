/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { DOCUMENT } from '@angular/common';
import {
  afterRenderEffect,
  booleanAttribute,
  Component,
  ElementRef,
  inject,
  input,
  signal,
  viewChild
} from '@angular/core';
import { areAnimationsDisabled } from '@siemens/element-ng/common';

const VISIBLE_SAMPLES = 40;
const MIN_HEIGHT = 2;
const MAX_HEIGHT = 16;
const SAMPLE_INTERVAL = 60;

/**
 * Decorative voice activity visualization. Audio capture and level measurement belong to the consumer.
 * Provide an accessible recording status alongside the waveform.
 *
 * @experimental
 */
@Component({
  selector: 'si-voice-waveform',
  template: `
    <div #track class="waveform-track">
      @for (bar of bars(); track bar.id) {
        <span
          class="waveform-bar"
          [class.silent]="bar.height === minHeight"
          [style.block-size.px]="bar.height"
        ></span>
      }
    </div>
  `,
  styleUrl: './si-voice-waveform.component.scss',
  host: { 'aria-hidden': 'true' }
})
export class SiVoiceWaveformComponent {
  private readonly document = inject(DOCUMENT);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly track = viewChild<ElementRef<HTMLElement>>('track');
  private readonly animationsDisabled = signal(false);
  private nextId = VISIBLE_SAMPLES + 1;
  private speech = false;
  private remainingSamples = 0;

  /**
   * Whether to generate samples. Inactive waveforms retain their last samples.
   * @defaultValue false
   */
  readonly active = input(false, { transform: booleanAttribute });

  /**
   * Latest audio level from 0 (silence) to 1 (maximum volume), sampled every 60 ms.
   * Values outside the range are clamped; non-finite values are treated as silence.
   * Omit to simulate speech bursts while active. Zero represents measured silence, not fallback.
   * @defaultValue undefined
   */
  readonly level = input<number>();

  protected readonly minHeight = MIN_HEIGHT;
  protected readonly bars = signal(
    Array.from({ length: VISIBLE_SAMPLES + 1 }, (_, index) => ({ id: index, height: MIN_HEIGHT }))
  );

  constructor() {
    afterRenderEffect(onCleanup => {
      this.active();
      const media = this.document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)');
      const update = (): void => {
        const flag = getComputedStyle(this.element.nativeElement).getPropertyValue(
          '--element-animations-enabled'
        );
        this.animationsDisabled.set(
          !!media?.matches || areAnimationsDisabled() || parseInt(flag, 10) === 0
        );
      };
      update();
      media?.addEventListener('change', update);
      onCleanup(() => media?.removeEventListener('change', update));
    });

    afterRenderEffect(onCleanup => {
      if (!this.active() || this.animationsDisabled()) {
        return;
      }
      const timer = setInterval(() => {
        const level = this.level() ?? this.simulateLevel();
        const height =
          MIN_HEIGHT +
          (MAX_HEIGHT - MIN_HEIGHT) *
            (Number.isFinite(level) ? Math.min(1, Math.max(0, level)) : 0);
        this.bars.update(bars => [...bars.slice(1), { id: this.nextId++, height }]);
      }, SAMPLE_INTERVAL);
      onCleanup(() => clearInterval(timer));
    });

    afterRenderEffect(onCleanup => {
      this.bars();
      if (!this.active() || this.animationsDisabled()) {
        return;
      }
      const animation = this.track()?.nativeElement.animate(
        [
          { transform: 'translateX(0)' },
          { transform: 'translateX(calc(-1px - var(--si-sys-sizing-spacing-x-10)))' }
        ],
        { duration: SAMPLE_INTERVAL, easing: 'linear' }
      );
      onCleanup(() => animation?.cancel());
    });
  }

  private simulateLevel(): number {
    if (!this.remainingSamples) {
      this.speech = !this.speech;
      this.remainingSamples = this.speech
        ? 3 + Math.floor(Math.random() * 6)
        : 2 + Math.floor(Math.random() * 4);
    }
    this.remainingSamples--;
    return (this.speech ? 5 + Math.random() * 9 : Math.random()) / (MAX_HEIGHT - MIN_HEIGHT);
  }
}
