/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MicrochartLineSeries, SiMicrochartLineComponent } from './si-microchart-line.component';

describe('SiMicrochartLineComponent', () => {
  let fixture: ComponentFixture<SiMicrochartLineComponent>;
  let element: HTMLElement;
  const series = signal<MicrochartLineSeries>({
    values: [2, 4, 6, 8, 10],
    colorToken: 'element-data-10'
  });
  const width = signal(64);
  const height = signal(24);
  const showMarkers = signal(false);
  const showArea = signal(false);
  const lineWidth = signal(2);
  const markerColor = signal<string | undefined>(undefined);

  const getSvg = (): SVGSVGElement => element.querySelector('svg')!;

  const getLinePath = (): SVGPathElement | null => element.querySelector('path[fill="none"]');

  const getMarkers = (): SVGCircleElement[] => Array.from(element.querySelectorAll('circle'));

  const getAreaPath = (): SVGPathElement | null => element.querySelector('path[stroke="none"]');

  const getGradient = (): SVGLinearGradientElement | null =>
    element.querySelector('linearGradient');

  beforeEach(() => {
    series.set({ values: [2, 4, 6, 8, 10], colorToken: 'element-data-10' });
    width.set(64);
    height.set(24);
    showMarkers.set(false);
    showArea.set(false);
    lineWidth.set(2);
    markerColor.set(undefined);
    fixture = TestBed.createComponent(SiMicrochartLineComponent, {
      bindings: [
        inputBinding('series', series),
        inputBinding('width', width),
        inputBinding('height', height),
        inputBinding('showMarkers', showMarkers),
        inputBinding('showArea', showArea),
        inputBinding('lineWidth', lineWidth),
        inputBinding('markerColor', markerColor)
      ]
    });
    element = fixture.nativeElement;
  });

  it('should render SVG with correct default viewBox', async () => {
    await fixture.whenStable();
    const svg = getSvg();
    expect(svg).toHaveAttribute('viewBox', '0 0 64 24');
    expect(svg).toHaveAttribute('width', '64');
    expect(svg).toHaveAttribute('height', '24');
  });

  it('should render line path with correct stroke color', async () => {
    await fixture.whenStable();
    const path = getLinePath();
    expect(path).toBeTruthy();
    expect(path!).toHaveAttribute('stroke', 'var(--element-data-10)');
  });

  it('should apply default lineWidth of 2', async () => {
    await fixture.whenStable();
    const path = getLinePath();
    expect(path!).toHaveAttribute('stroke-width', '2');
  });

  it('should render a path with M and L commands', async () => {
    await fixture.whenStable();
    const d = getLinePath()!.getAttribute('d')!;
    expect(d).toContain('M');
    expect(d).toContain('L');
  });

  it('should return empty path for fewer than 2 values', async () => {
    series.set({ values: [5], colorToken: 'element-data-10' });
    await fixture.whenStable();

    const path = getLinePath();
    expect(path!).toHaveAttribute('d', '');
  });

  it('should not render markers by default', async () => {
    await fixture.whenStable();
    expect(getMarkers()).toHaveLength(0);
  });

  it('should render markers when showMarkers is true', async () => {
    showMarkers.set(true);
    await fixture.whenStable();

    expect(getMarkers()).toHaveLength(5);
  });

  it('should use series colorToken for markers by default', async () => {
    showMarkers.set(true);
    await fixture.whenStable();

    for (const marker of getMarkers()) {
      expect(marker).toHaveAttribute('fill', 'var(--element-data-10)');
    }
  });

  it('should use markerColor for markers when provided', async () => {
    showMarkers.set(true);
    markerColor.set('element-data-2');
    await fixture.whenStable();

    for (const marker of getMarkers()) {
      expect(marker).toHaveAttribute('fill', 'var(--element-data-2)');
    }
  });

  it('should not render area gradient by default', async () => {
    await fixture.whenStable();
    expect(getGradient()).toBeNull();
    expect(getAreaPath()).toBeNull();
  });

  it('should render area fill when showArea is true', async () => {
    showArea.set(true);
    await fixture.whenStable();

    expect(getGradient()).toBeTruthy();
    const areaPath = getAreaPath();
    expect(areaPath).toBeTruthy();
    expect(areaPath!.getAttribute('d')).toContain('Z');
  });

  it('should apply custom dimensions', async () => {
    width.set(128);
    height.set(48);
    await fixture.whenStable();

    const svg = getSvg();
    expect(svg).toHaveAttribute('viewBox', '0 0 128 48');
    expect(svg).toHaveAttribute('width', '128');
    expect(svg).toHaveAttribute('height', '48');
  });

  it('should apply custom lineWidth', async () => {
    lineWidth.set(4);
    await fixture.whenStable();

    const path = getLinePath();
    expect(path!).toHaveAttribute('stroke-width', '4');
  });

  it('should set marker radius equal to lineWidth', async () => {
    showMarkers.set(true);
    lineWidth.set(3);
    await fixture.whenStable();

    for (const marker of getMarkers()) {
      expect(marker).toHaveAttribute('r', '3');
    }
  });
});
