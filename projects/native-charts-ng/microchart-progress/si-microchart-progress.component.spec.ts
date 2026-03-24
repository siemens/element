/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  MicrochartProgressSeries,
  SiMicrochartProgressComponent
} from './si-microchart-progress.component';

describe('SiMicrochartProgressComponent', () => {
  let fixture: ComponentFixture<SiMicrochartProgressComponent>;
  let element: HTMLElement;
  const series = signal<MicrochartProgressSeries>({
    valuePercent: 80,
    colorToken: 'element-data-7'
  });
  const barWidth = signal(64);
  const barHeight = signal(4);

  beforeEach(() => {
    series.set({ valuePercent: 80, colorToken: 'element-data-7' });
    barWidth.set(64);
    barHeight.set(4);
    fixture = TestBed.createComponent(SiMicrochartProgressComponent, {
      bindings: [
        inputBinding('series', series),
        inputBinding('barWidth', barWidth),
        inputBinding('barHeight', barHeight)
      ]
    });
    element = fixture.nativeElement;
  });

  it('should display the percentage text', async () => {
    await fixture.whenStable();
    expect(element.querySelector('.si-body')).toHaveTextContent('80%');
  });

  it('should set bar foreground width to valuePercent', async () => {
    await fixture.whenStable();
    const foreground = element.querySelector('.bar-foreground') as HTMLElement;
    expect(foreground).toHaveStyle({ width: '80%' });
  });

  it('should apply color token as CSS variable on foreground bar', async () => {
    await fixture.whenStable();
    const foreground = element.querySelector('.bar-foreground') as HTMLElement;
    expect(foreground).toHaveStyle({ backgroundColor: 'var(--element-data-7)' });
  });

  it('should use default barWidth of 64px', async () => {
    await fixture.whenStable();
    const container = element.firstElementChild as HTMLElement;
    expect(container).toHaveStyle({ width: '64px' });
  });

  it('should use default barHeight of 4px', async () => {
    await fixture.whenStable();
    const background = element.querySelector('.bar-background') as HTMLElement;
    const foreground = element.querySelector('.bar-foreground') as HTMLElement;
    expect(background).toHaveStyle({ height: '4px' });
    expect(foreground).toHaveStyle({ height: '4px' });
    expect(background).toHaveStyle({ borderRadius: '2px' });
  });

  it('should apply custom barWidth and barHeight', async () => {
    barWidth.set(100);
    barHeight.set(8);
    await fixture.whenStable();

    const container = element.firstElementChild as HTMLElement;
    const background = element.querySelector('.bar-background') as HTMLElement;
    expect(container).toHaveStyle({ width: '100px' });
    expect(background).toHaveStyle({ height: '8px' });
    expect(background).toHaveStyle({ borderRadius: '4px' });
  });

  it('should update when series input changes', async () => {
    await fixture.whenStable();

    series.set({ valuePercent: 30, colorToken: 'element-data-2' });
    await fixture.whenStable();

    expect(element.querySelector('.si-body')).toHaveTextContent('30%');
    const foreground = element.querySelector('.bar-foreground') as HTMLElement;
    expect(foreground).toHaveStyle({ width: '30%' });
    expect(foreground).toHaveStyle({ backgroundColor: 'var(--element-data-2)' });
  });
});
