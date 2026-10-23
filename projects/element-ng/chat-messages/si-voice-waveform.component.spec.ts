import { inputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiVoiceWaveformComponent } from './si-voice-waveform.component';

describe('SiVoiceWaveformComponent', () => {
  let fixture: ComponentFixture<SiVoiceWaveformComponent>;
  let active: ReturnType<typeof signal<boolean>>;
  let level: ReturnType<typeof signal<number | undefined>>;
  let media: MediaQueryList;
  let reducedMotion: boolean;

  const bars = (): HTMLElement[] => Array.from(fixture.nativeElement.querySelectorAll('span'));
  const heights = (): number[] => bars().map(bar => parseFloat(bar.style.blockSize));
  const advance = async (duration = 60): Promise<void> => {
    await vi.advanceTimersByTimeAsync(duration);
    await fixture.whenStable();
  };

  beforeEach(() => {
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
