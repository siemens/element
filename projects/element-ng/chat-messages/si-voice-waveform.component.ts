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
          [class.silent]="bar.height === 2"
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
  private readonly track = viewChild<ElementRef<HTMLElement>>('track');
  private readonly reducedMotion = signal(false);
  private nextId = 41;
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

  protected readonly bars = signal(
    Array.from({ length: 41 }, (_, index) => ({ id: index, height: 2 }))
  );

  constructor() {
    afterRenderEffect(onCleanup => {
      const media = this.document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)');
      if (!media) {
        return;
      }
      const update = (): void => this.reducedMotion.set(media.matches);
      update();
      media.addEventListener('change', update);
      onCleanup(() => media.removeEventListener('change', update));
    });

    afterRenderEffect(onCleanup => {
      if (!this.active() || this.reducedMotion()) {
        return;
      }
      const timer = setInterval(() => {
        const level = this.level() ?? this.simulateLevel();
        const height = 2 + 14 * (Number.isFinite(level) ? Math.min(1, Math.max(0, level)) : 0);
        this.bars.update(bars => [...bars.slice(1), { id: this.nextId++, height }]);
      }, 60);
      onCleanup(() => clearInterval(timer));
    });

    afterRenderEffect(onCleanup => {
      this.bars();
      if (!this.active() || this.reducedMotion()) {
        return;
      }
      const animation = this.track()?.nativeElement.animate(
        [
          { transform: 'translateX(calc(1px + var(--si-sys-sizing-spacing-x-10)))' },
          { transform: 'translateX(0)' }
        ],
        { duration: 60, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
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
    return this.speech ? (5 + Math.random() * 9) / 14 : Math.random() / 14;
  }
}
