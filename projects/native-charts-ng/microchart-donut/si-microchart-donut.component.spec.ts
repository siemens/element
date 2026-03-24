/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MicrochartDonutSeries, SiMicrochartDonutComponent } from './si-microchart-donut.component';

describe('SiMicrochartDonutComponent', () => {
  let fixture: ComponentFixture<SiMicrochartDonutComponent>;
  let element: HTMLElement;
  const series = signal<MicrochartDonutSeries[]>([
    { valuePercent: 40, colorToken: 'element-data-4' }
  ]);
  const radius = signal(7.5);

  const multiSeries: MicrochartDonutSeries[] = [
    { valuePercent: 30, colorToken: 'element-data-1', id: 'series-a' },
    { valuePercent: 50, colorToken: 'element-data-5', id: 'series-b' }
  ];

  const getSvg = (): SVGSVGElement => element.querySelector('svg')!;

  const getBackgroundPath = (): SVGPathElement | null => element.querySelector('g.background path');

  const getDataPaths = (): SVGPathElement[] => Array.from(element.querySelectorAll('g.data path'));

  beforeEach(() => {
    series.set([{ valuePercent: 40, colorToken: 'element-data-4' }]);
    radius.set(7.5);
    fixture = TestBed.createComponent(SiMicrochartDonutComponent, {
      bindings: [inputBinding('series', series), inputBinding('radius', radius)]
    });
    element = fixture.nativeElement;
  });

  it('should render SVG with correct viewBox dimensions', async () => {
    await fixture.whenStable();
    // Default radius = 7.5, arcThickness = 0.7 * 7.5 = 5.25, bufferSpace = 4
    // size = 2*7.5 + 5.25 + 4 = 24.25
    const svg = getSvg();
    expect(svg).toHaveAttribute('viewBox', '0 0 24.25 24.25');
    expect(svg).toHaveAttribute('width', '24.25');
    expect(svg).toHaveAttribute('height', '24.25');
  });

  it('should render background arc path', async () => {
    await fixture.whenStable();
    const bgPath = getBackgroundPath();
    expect(bgPath).toBeTruthy();
    expect(bgPath!.getAttribute('d')).toBeTruthy();
  });

  it('should set background stroke-width to arcThickness', async () => {
    await fixture.whenStable();
    const bgPath = getBackgroundPath();
    // arcThickness = 0.7 * 7.5 = 5.25
    expect(bgPath!).toHaveStyle({ strokeWidth: '5.25' });
  });

  it('should render one data arc for a single series', async () => {
    await fixture.whenStable();
    expect(getDataPaths()).toHaveLength(1);
  });

  it('should render multiple data arcs for multiple series', async () => {
    series.set(multiSeries);
    await fixture.whenStable();

    expect(getDataPaths()).toHaveLength(2);
  });

  it('should apply correct stroke color from colorToken', async () => {
    series.set(multiSeries);
    await fixture.whenStable();

    const paths = getDataPaths();
    expect(paths[0]).toHaveStyle({ stroke: 'var(--element-data-1)' });
    expect(paths[1]).toHaveStyle({ stroke: 'var(--element-data-5)' });
  });

  it('should set data arc stroke-width to arcThickness', async () => {
    await fixture.whenStable();
    const paths = getDataPaths();
    expect(paths[0]).toHaveStyle({ strokeWidth: '5.25' });
  });

  it('should apply data-id attribute when provided', async () => {
    series.set(multiSeries);
    await fixture.whenStable();

    const paths = getDataPaths();
    expect(paths[0]).toHaveAttribute('data-id', 'series-a');
    expect(paths[1]).toHaveAttribute('data-id', 'series-b');
  });

  it('should skip series with 0 valuePercent', async () => {
    series.set([
      { valuePercent: 0, colorToken: 'element-data-1' },
      { valuePercent: 50, colorToken: 'element-data-5' }
    ]);
    await fixture.whenStable();

    expect(getDataPaths()).toHaveLength(1);
  });

  it('should skip series with negative valuePercent', async () => {
    series.set([{ valuePercent: -10, colorToken: 'element-data-1' }]);
    await fixture.whenStable();

    expect(getDataPaths()).toHaveLength(0);
  });

  it('should update when radius changes', async () => {
    radius.set(20);
    await fixture.whenStable();

    // size = 2*20 + 0.7*20 + 4 = 40 + 14 + 4 = 58
    const svg = getSvg();
    expect(svg).toHaveAttribute('viewBox', '0 0 58 58');

    // arcThickness = 0.7 * 20 = 14
    const bgPath = getBackgroundPath();
    expect(bgPath!).toHaveStyle({ strokeWidth: '14' });
  });

  it('should render empty data section when series is empty', async () => {
    series.set([]);
    await fixture.whenStable();

    expect(getDataPaths()).toHaveLength(0);
  });
});
