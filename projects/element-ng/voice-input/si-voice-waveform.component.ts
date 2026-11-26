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

/** Number of visible bars; one extra bar sits off-screen to smooth scrolling. */
const VISIBLE_SAMPLES = 40;
/** Silent baseline bar height in rem (2 px at 16 px root font size). */
const MIN_HEIGHT_REM = 0.125;
/** Peak bar height in rem (16 px at 16 px root font size). */
const MAX_HEIGHT_REM = 1;
/** Sampling and scroll period in milliseconds (~16.7 samples/s). */
const SAMPLE_INTERVAL_MS = 60;
/** Simulated speech burst duration (3–8 samples) and level range (5–14 px above baseline). */
const SPEECH_BURST = { minSamples: 3, maxSamples: 8, minLevel: 5 / 14, maxLevel: 1 };
/** Simulated pause duration (2–5 samples) and near-silent level range (0–1 px above baseline). */
const QUIET_GAP = { minSamples: 2, maxSamples: 5, minLevel: 0, maxLevel: 1 / 14 };

/**
 * Decorative voice activity waveform.
 * Pair with an accessible status announcement while recording.
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
          [style.block-size.rem]="bar.height"
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
   * Whether the waveform is actively sampling. Inactive waveforms freeze their last samples.
   * @defaultValue false
   */
  readonly active = input(false, { transform: booleanAttribute });

  /**
   * Audio level from `0` (silence) to `1` (peak), sampled every 60 ms.
   * Out-of-range values are clamped and non-finite values are treated as `0`.
   * Omit to simulate speech activity while active.
   * @defaultValue undefined
   */
  readonly level = input<number>();

  protected readonly minHeight = MIN_HEIGHT_REM;
  protected readonly bars = signal(
    Array.from({ length: VISIBLE_SAMPLES + 1 }, (_, index) => ({
      id: index,
      height: MIN_HEIGHT_REM
    }))
  );

  constructor() {
    afterRenderEffect(onCleanup => {
      const update = (): void =>
        this.animationsDisabled.set(areAnimationsDisabled(this.element.nativeElement));
      update();
      if (!this.active()) {
        return;
      }
      // Re-read `--element-animations-enabled` if `prefers-reduced-motion` changes mid-recording.
      const media = this.document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)');
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
          MIN_HEIGHT_REM +
          (MAX_HEIGHT_REM - MIN_HEIGHT_REM) *
            (Number.isFinite(level) ? Math.min(1, Math.max(0, level)) : 0);
        this.bars.update(bars => [...bars.slice(1), { id: this.nextId++, height }]);
      }, SAMPLE_INTERVAL_MS);
      onCleanup(() => clearInterval(timer));
    });

    afterRenderEffect(onCleanup => {
      this.bars();
      if (!this.active() || this.animationsDisabled()) {
        return;
      }
      // CSS parks the track one bar-step left; a single offset-0 keyframe animates smoothly
      // from translateX(0) back to the CSS resting transform as each new bar enters.
      const animation = this.track()?.nativeElement.animate(
        [{ transform: 'translateX(0)', offset: 0 }],
        { duration: SAMPLE_INTERVAL_MS, easing: 'linear' }
      );
      onCleanup(() => animation?.cancel());
    });
  }

  private simulateLevel(): number {
    if (!this.remainingSamples) {
      this.speech = !this.speech;
      const { minSamples, maxSamples } = this.speech ? SPEECH_BURST : QUIET_GAP;
      this.remainingSamples =
        minSamples + Math.floor(Math.random() * (maxSamples - minSamples + 1));
    }
    this.remainingSamples--;
    const { minLevel, maxLevel } = this.speech ? SPEECH_BURST : QUIET_GAP;
    return minLevel + Math.random() * (maxLevel - minLevel);
  }
}
