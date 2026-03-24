/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MicrochartBarSeries, SiMicrochartBarComponent } from './si-microchart-bar.component';

describe('SiMicrochartBarComponent', () => {
  let fixture: ComponentFixture<SiMicrochartBarComponent>;
  let element: HTMLElement;
  const series = signal<MicrochartBarSeries>({
    values: [2, 4, 6, 8, 10],
    colorToken: 'element-data-7'
  });
  const width = signal(64);
  const height = signal(24);

  beforeEach(() => {
    series.set({ values: [2, 4, 6, 8, 10], colorToken: 'element-data-7' });
    width.set(64);
    height.set(24);
    fixture = TestBed.createComponent(SiMicrochartBarComponent, {
      bindings: [
        inputBinding('series', series),
        inputBinding('width', width),
        inputBinding('height', height)
      ]
    });
    element = fixture.nativeElement;
  });

  const getBars = (): HTMLElement[] =>
    Array.from(element.querySelectorAll('.position-relative > .position-absolute'));

  it('should render correct number of bars', async () => {
    await fixture.whenStable();
    expect(getBars()).toHaveLength(5);
  });

  it('should apply color token to bar backgrounds', async () => {
    await fixture.whenStable();
    for (const bar of getBars()) {
      expect(bar).toHaveStyle({ backgroundColor: 'var(--element-data-7)' });
    }
  });

  it('should use default dimensions 64x24', async () => {
    await fixture.whenStable();
    const container = element.querySelector('.py-2') as HTMLElement;
    expect(container).toHaveStyle({ width: '64px', height: '24px' });
  });

  it('should apply custom dimensions', async () => {
    width.set(120);
    height.set(48);
    await fixture.whenStable();

    const container = element.querySelector('.py-2') as HTMLElement;
    expect(container).toHaveStyle({ width: '120px', height: '48px' });
  });

  it('should render all-positive values with bars anchored at bottom', async () => {
    await fixture.whenStable();
    const bars = getBars();
    // For all-positive: zeroPosition = 100 (bottom), bars grow upward
    // The tallest bar (value 10) should have top 0% and height 100%
    const tallest = bars[4];
    expect(parseFloat(tallest.style.height)).toBeCloseTo(100);
    expect(parseFloat(tallest.style.top)).toBeCloseTo(0);

    // The shortest bar (value 2) should have height 20%
    const shortest = bars[0];
    expect(parseFloat(shortest.style.height)).toBeCloseTo(20);
  });

  it('should render all-negative values with bars growing downward from zero line', async () => {
    series.set({ values: [-3, -6, -9], colorToken: 'element-data-5' });
    await fixture.whenStable();

    const bars = getBars();
    // maxValue = max(-3,-6,-9,1) = 1, minValue = min(-3,-6,-9,0) = -9
    // range = 1 + 9 = 10, zeroPosition = (1/10)*100 = 10
    // All negative bars should have top = zeroPosition = 10
    for (const bar of bars) {
      expect(parseFloat(bar.style.top)).toBeCloseTo(10);
    }
    // Tallest negative bar (-9) should have height = (9/10)*100 = 90%
    expect(parseFloat(bars[2].style.height)).toBeCloseTo(90);
  });

  it('should render mixed positive/negative values with zero line', async () => {
    series.set({ values: [10, -10], colorToken: 'element-data-3' });
    await fixture.whenStable();

    const bars = getBars();
    // Range = 20, zeroPosition = (10/20)*100 = 50
    const positiveBar = bars[0];
    const negativeBar = bars[1];

    // Positive bar: height = (10/20)*100 = 50%, top = 50 - 50 = 0%
    expect(parseFloat(positiveBar.style.height)).toBeCloseTo(50);
    expect(parseFloat(positiveBar.style.top)).toBeCloseTo(0);

    // Negative bar: height = (10/20)*100 = 50%, top = 50%
    expect(parseFloat(negativeBar.style.height)).toBeCloseTo(50);
    expect(parseFloat(negativeBar.style.top)).toBeCloseTo(50);
  });

  it('should use negativeColorToken for negative values', async () => {
    series.set({
      values: [5, -5],
      colorToken: 'element-data-7',
      negativeColorToken: 'element-data-1'
    });
    await fixture.whenStable();

    const bars = getBars();
    expect(bars[0]).toHaveStyle({ backgroundColor: 'var(--element-data-7)' });
    expect(bars[1]).toHaveStyle({ backgroundColor: 'var(--element-data-1)' });
  });

  it('should use main colorToken for negative values when no negativeColorToken', async () => {
    series.set({ values: [5, -5], colorToken: 'element-data-7' });
    await fixture.whenStable();

    const bars = getBars();
    expect(bars[1]).toHaveStyle({ backgroundColor: 'var(--element-data-7)' });
  });
});
