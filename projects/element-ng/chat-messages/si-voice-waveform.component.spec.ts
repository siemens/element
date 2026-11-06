/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiVoiceWaveformComponent } from './si-voice-waveform.component';

describe('SiVoiceWaveformComponent', () => {
  let fixture: ComponentFixture<SiVoiceWaveformComponent>;
  let active: ReturnType<typeof signal<boolean>>;
  let level: ReturnType<typeof signal<number | undefined>>;
  let media: MediaQueryList;
  let reducedMotion: boolean;
  let originalAnimationFlag: string;

  const bars = (): HTMLElement[] => Array.from(fixture.nativeElement.querySelectorAll('span'));
  const heights = (): number[] => bars().map(bar => parseFloat(bar.style.blockSize));
  const advance = async (duration = 60): Promise<void> => {
    await vi.advanceTimersByTimeAsync(duration);
    await fixture.whenStable();
  };

  beforeEach(() => {
    originalAnimationFlag = document.documentElement.style.getPropertyValue(
      '--element-animations-enabled'
    );
    document.documentElement.style.setProperty('--element-animations-enabled', '1');
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    active = signal(false);
    level = signal<number | undefined>(undefined);
    reducedMotion = false;
    media = window.matchMedia('(prefers-reduced-motion: reduce)');
    vi.spyOn(window, 'matchMedia').mockReturnValue(media);
    vi.spyOn(media, 'matches', 'get').mockImplementation(() => reducedMotion);
    fixture = TestBed.createComponent(SiVoiceWaveformComponent, {
      bindings: [inputBinding('active', active), inputBinding('level', level)]
    });
  });

  afterEach(() => {
    fixture.destroy();
    if (originalAnimationFlag) {
      document.documentElement.style.setProperty(
        '--element-animations-enabled',
        originalAnimationFlag
      );
    } else {
      document.documentElement.style.removeProperty('--element-animations-enabled');
    }
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders a silent decorative waveform without starting a timer by default', async () => {
    await fixture.whenStable();

    expect(fixture.nativeElement).toHaveAttribute('aria-hidden', 'true');
    expect(bars()).toHaveLength(41);
    expect(bars().every(bar => bar.classList.contains('silent'))).toBe(true);
    expect(heights()).toEqual(Array(41).fill(2));
    expect(vi.getTimerCount()).toBe(0);
  });

  it('samples the latest level every 60 ms rather than queuing updates', async () => {
    active.set(true);
    level.set(0.25);
    await fixture.whenStable();

    await advance(59);
    expect(heights()).toEqual(Array(41).fill(2));

    level.set(0.5);
    await advance(1);
    expect(heights().at(-1)).toBe(9);
    expect(bars().at(-1)).not.toHaveClass('silent');

    level.set(1);
    await advance();
    expect(heights().slice(-2)).toEqual([9, 16]);
    expect(bars()).toHaveLength(41);
  });

  it('scrolls at constant speed and preserves sample positions across intervals', async () => {
    active.set(true);
    level.set(1);
    await fixture.whenStable();
    await advance();

    const newest = bars().at(-1)!;
    const animation: Animation = fixture.nativeElement.getAnimations({ subtree: true })[0];
    animation.pause();
    animation.currentTime = 0;
    const start = newest.getBoundingClientRect().left;

    for (const elapsed of [15, 30, 45, 60]) {
      animation.currentTime = elapsed;
      expect(start - newest.getBoundingClientRect().left).toBeCloseTo((3 * elapsed) / 60, 2);
    }
    const end = newest.getBoundingClientRect().left;

    await advance();
    const nextAnimation: Animation = fixture.nativeElement.getAnimations({ subtree: true })[0];
    nextAnimation.pause();
    nextAnimation.currentTime = 0;

    expect(bars().at(-2)).toBe(newest);
    expect(newest.getBoundingClientRect().left).toBeCloseTo(end, 2);
  });

  it.each([
    { level: -1, height: 2 },
    { level: 2, height: 16 },
    { level: NaN, height: 2 },
    { level: Infinity, height: 2 },
    { level: -Infinity, height: 2 }
  ])('maps level $level to a safe height of $height px', async sample => {
    active.set(true);
    level.set(sample.level);
    await fixture.whenStable();

    await advance();

    expect(heights().at(-1)).toBe(sample.height);
  });

  it('treats measured zero as silence without simulating speech', async () => {
    const random = vi.spyOn(Math, 'random');
    active.set(true);
    level.set(0);
    await fixture.whenStable();

    await advance(600);

    expect(heights()).toEqual(Array(41).fill(2));
    expect(random).not.toHaveBeenCalled();
  });

  it('alternates speech bursts with quiet periods when no level is supplied', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    active.set(true);
    await fixture.whenStable();

    await advance(60 * 11);

    expect(heights().slice(-11)).toEqual([...Array(6).fill(11.5), ...Array(4).fill(2.5), 11.5]);
  });

  it('switches between fallback and measured levels without resetting history', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    active.set(true);
    await fixture.whenStable();
    await advance();

    level.set(0);
    await advance();
    level.set(undefined);
    await advance();

    expect(heights().slice(-3)).toEqual([11.5, 2, 11.5]);
  });

  it('freezes while inactive and resumes with the latest level', async () => {
    active.set(true);
    level.set(1);
    await fixture.whenStable();
    await advance();

    active.set(false);
    await fixture.whenStable();
    const frozenHeights = heights();
    expect(vi.getTimerCount()).toBe(0);

    level.set(0);
    await advance(600);
    expect(heights()).toEqual(frozenHeights);

    active.set(true);
    await fixture.whenStable();
    await advance();
    expect(heights().slice(-2)).toEqual([16, 2]);
  });

  it('does not animate or sample when reduced motion is requested', async () => {
    reducedMotion = true;
    active.set(true);
    level.set(1);
    await fixture.whenStable();

    await advance(600);

    expect(heights()).toEqual(Array(41).fill(2));
    expect(vi.getTimerCount()).toBe(0);
    expect(fixture.nativeElement.getAnimations({ subtree: true })).toHaveLength(0);
  });

  it.each(['global', 'scoped'])(
    'does no decorative work when %s animations are disabled',
    async scope => {
      if (scope === 'global') {
        document.documentElement.style.setProperty('--element-animations-enabled', '0');
      } else {
        fixture.nativeElement.classList.add('disable-animations');
      }
      active.set(true);
      level.set(1);
      await fixture.whenStable();

      await advance(600);

      expect(heights()).toEqual(Array(41).fill(2));
      expect(vi.getTimerCount()).toBe(0);
      expect(fixture.nativeElement.getAnimations({ subtree: true })).toHaveLength(0);
    }
  );

  it('keeps the newest sample visible when sampling stops', async () => {
    active.set(true);
    level.set(1);
    await fixture.whenStable();
    await advance();

    active.set(false);
    await fixture.whenStable();

    const viewport = fixture.nativeElement.getBoundingClientRect();
    const newest = bars().at(-1)!.getBoundingClientRect();
    expect(newest.left).toBeGreaterThanOrEqual(viewport.left);
    expect(newest.right).toBeLessThanOrEqual(viewport.right);
    expect(newest.height).toBe(16);
  });

  it('responds to reduced-motion changes during recording', async () => {
    active.set(true);
    level.set(1);
    await fixture.whenStable();
    await advance();

    reducedMotion = true;
    media.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    const frozenHeights = heights();
    await advance(600);
    expect(heights()).toEqual(frozenHeights);
    expect(vi.getTimerCount()).toBe(0);

    reducedMotion = false;
    media.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    await advance();
    expect(heights().slice(-2)).toEqual([16, 16]);
  });

  it('releases the sampling timer and media listener on destruction', async () => {
    const removeListener = vi.spyOn(media, 'removeEventListener');
    active.set(true);
    await fixture.whenStable();

    fixture.destroy();

    expect(vi.getTimerCount()).toBe(0);
    expect(removeListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
