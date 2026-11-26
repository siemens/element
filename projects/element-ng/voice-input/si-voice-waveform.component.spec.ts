/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { onTestFinished } from 'vitest';

import { SiVoiceWaveformComponent } from './si-voice-waveform.component';

@Component({
  imports: [SiVoiceWaveformComponent],
  template: `<div style="--element-animations-enabled: 1">
    <si-voice-waveform class="disable-animations" [active]="active()" [level]="level()" />
  </div>`
})
class ScopedDisabledWaveformHostComponent {
  readonly active = signal(false);
  readonly level = signal<number | undefined>(undefined);
}

describe('SiVoiceWaveformComponent', () => {
  let fixture: ComponentFixture<SiVoiceWaveformComponent>;
  let active: ReturnType<typeof signal<boolean>>;
  let level: ReturnType<typeof signal<number | undefined>>;
  let media: MediaQueryList;

  const bars = (): HTMLElement[] => Array.from(fixture.nativeElement.querySelectorAll('span'));
  const heights = (): number[] => bars().map(bar => bar.getBoundingClientRect().height);
  const advance = async (duration = 60): Promise<void> => {
    await vi.advanceTimersByTimeAsync(duration);
    await fixture.whenStable();
  };

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    onTestFinished(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
    });
    active = signal(false);
    level = signal<number | undefined>(undefined);
    media = window.matchMedia('(prefers-reduced-motion: reduce)');
    vi.spyOn(window, 'matchMedia').mockReturnValue(media);
    fixture = TestBed.createComponent(SiVoiceWaveformComponent, {
      bindings: [inputBinding('active', active), inputBinding('level', level)]
    });
    fixture.nativeElement.style.setProperty('--element-animations-enabled', '1');
  });

  it('renders a silent decorative waveform without starting a timer by default', async () => {
    await fixture.whenStable();

    expect(fixture.nativeElement).toHaveAttribute('aria-hidden', 'true');
    expect(bars()).toHaveLength(41);
    for (const bar of bars()) {
      expect(bar).toHaveClass('silent');
    }
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

  it('does no decorative work when global animations are disabled', async () => {
    fixture.nativeElement.style.removeProperty('--element-animations-enabled');
    active.set(true);
    level.set(1);
    await fixture.whenStable();

    await advance(600);

    expect(heights()).toEqual(Array(41).fill(2));
    expect(vi.getTimerCount()).toBe(0);
    expect(fixture.nativeElement.getAnimations({ subtree: true })).toHaveLength(0);
  });

  it('does no decorative work when scoped animations are disabled', async () => {
    const scopedFixture = TestBed.createComponent(ScopedDisabledWaveformHostComponent);
    scopedFixture.componentInstance.active.set(true);
    scopedFixture.componentInstance.level.set(1);
    await scopedFixture.whenStable();

    await vi.advanceTimersByTimeAsync(600);
    await scopedFixture.whenStable();

    const scopedBars = Array.from<HTMLElement>(
      scopedFixture.nativeElement.querySelectorAll('span')
    );
    expect(scopedBars.map(bar => bar.getBoundingClientRect().height)).toEqual(Array(41).fill(2));
    expect(vi.getTimerCount()).toBe(0);
    expect(scopedFixture.nativeElement.getAnimations({ subtree: true })).toHaveLength(0);
  });

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

    fixture.nativeElement.style.removeProperty('--element-animations-enabled');
    media.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    const frozenHeights = heights();
    await advance(600);
    expect(heights()).toEqual(frozenHeights);
    expect(vi.getTimerCount()).toBe(0);

    fixture.nativeElement.style.setProperty('--element-animations-enabled', '1');
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
