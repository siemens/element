/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { userEvent } from 'vitest/browser';

import { GaugeSegment, GaugeSeries, SiNChartGaugeComponent } from './si-nchart-gauge.component';

@Component({
  imports: [SiNChartGaugeComponent],
  template: `
    <si-nchart-gauge
      [startAngle]="startAngle()"
      [endAngle]="endAngle()"
      [min]="min()"
      [max]="max()"
      [mode]="mode()"
      [series]="series()"
      [segments]="segments()"
      [unit]="unit()"
      [showTicks]="showTicks()"
      [showLegend]="showLegend()"
      [legendPosition]="legendPosition()"
      [showRangeLabelsOutside]="showRangeLabelsOutside()"
      [valueFormatter]="valueFormatter()"
      [axisLabelFormatter]="axisLabelFormatter()"
      [minNumberOfDecimals]="minNumberOfDecimals()"
      [maxNumberOfDecimals]="maxNumberOfDecimals()"
      [axisNumberOfDecimals]="axisNumberOfDecimals()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
  readonly gauge = viewChild.required(SiNChartGaugeComponent);
  readonly startAngle = signal(-90);
  readonly endAngle = signal(90);
  readonly min = signal(-100);
  readonly max = signal(100);
  readonly mode = signal<'sum' | 'single'>('sum');
  readonly series = signal<GaugeSeries[]>([]);
  readonly segments = signal<GaugeSegment[]>([]);
  readonly unit = signal('');
  readonly showTicks = signal(true);
  readonly showLegend = signal(true);
  readonly legendPosition = signal<'row' | 'column'>('row');
  readonly showRangeLabelsOutside = signal(false);
  readonly valueFormatter = signal<((val: number) => string) | undefined>(undefined);
  readonly axisLabelFormatter = signal<((val: number) => string) | undefined>(undefined);
  readonly minNumberOfDecimals = signal(0);
  readonly maxNumberOfDecimals = signal(2);
  readonly axisNumberOfDecimals = signal(0);
}

describe('SiNChartGaugeComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let gaugeEl: HTMLElement;

  const defaultSeries: GaugeSeries[] = [
    { value: 30, colorToken: 'element-data-7', name: 'Series A' },
    { value: 20, colorToken: 'element-data-4', name: 'Series B' }
  ];

  const getSvg = (): SVGSVGElement => gaugeEl.querySelector('svg')!;

  const getBackgroundPath = (): SVGPathElement | null => gaugeEl.querySelector('g.background path');

  const getDataPaths = (): SVGPathElement[] => Array.from(gaugeEl.querySelectorAll('g.data path'));

  const getTickPaths = (): SVGPathElement[] => Array.from(gaugeEl.querySelectorAll('g.ticks path'));

  const getTickLabels = (): string[] =>
    Array.from(gaugeEl.querySelectorAll('g.tick-labels text')).map(
      el => el.textContent?.trim() ?? ''
    );
  const getValueText = (): string => gaugeEl.querySelector('text.value')?.textContent?.trim() ?? '';

  const getLegendTable = (): HTMLTableElement | null => gaugeEl.querySelector('table.legend-table');

  const getLegendRows = (): HTMLTableRowElement[] =>
    Array.from(gaugeEl.querySelectorAll('table.legend-table tbody tr'));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    gaugeEl = (fixture.nativeElement as HTMLElement).querySelector('si-nchart-gauge')!;
  });

  it('should display value text', async () => {
    host.series.set(defaultSeries);
    await fixture.whenStable();
    expect(getValueText()).toContain('50');
  });

  it('should render SVG with background arc', async () => {
    await fixture.whenStable();
    const bgPath = getBackgroundPath();
    expect(bgPath).toBeTruthy();
    expect(bgPath!.getAttribute('d')).toBeTruthy();
  });

  describe('sum mode', () => {
    it('should render data arcs for each series', async () => {
      host.series.set(defaultSeries);
      await fixture.whenStable();

      expect(getDataPaths().length).toBeGreaterThanOrEqual(1);
    });

    it('should display sum of series values', async () => {
      host.series.set(defaultSeries);
      await fixture.whenStable();

      // 30 + 20 = 50
      expect(getValueText()).toContain('50');
    });

    it('should handle positive and negative series values', async () => {
      host.series.set([
        { value: 40, colorToken: 'element-data-7', name: 'Positive' },
        { value: -20, colorToken: 'element-data-1', name: 'Negative' }
      ]);
      await fixture.whenStable();

      const paths = getDataPaths();
      expect(paths).toHaveLength(2);
      // Sum = 40 + (-20) = 20
      expect(getValueText()).toContain('20');
    });

    it('should show unit when provided', async () => {
      host.series.set(defaultSeries);
      host.unit.set('kW');
      await fixture.whenStable();

      const unitEl = gaugeEl.querySelector('tspan.unit');
      expect(unitEl).toHaveTextContent('kW');
    });

    it('should not show unit tspan when unit is empty', async () => {
      host.series.set(defaultSeries);
      await fixture.whenStable();

      expect(gaugeEl.querySelector('tspan.unit')).not.toBeInTheDocument();
    });

    it('should apply data-id attribute when provided', async () => {
      host.series.set([
        { value: 30, colorToken: 'element-data-7', name: 'A', id: 'gauge-a' },
        { value: 20, colorToken: 'element-data-4', name: 'B', id: 'gauge-b' }
      ]);
      await fixture.whenStable();

      const paths = getDataPaths();
      expect(paths[0]).toHaveAttribute('data-id', 'gauge-a');
      expect(paths[1]).toHaveAttribute('data-id', 'gauge-b');
    });

    it('should not render data arc for series with value 0', async () => {
      host.series.set([{ value: 0, colorToken: 'element-data-7', name: 'Zero' }]);
      await fixture.whenStable();

      // Value 0 produces same start/end angle, so path is empty string and the @if hides it
      expect(getDataPaths()).toHaveLength(0);
    });
  });

  describe('single mode', () => {
    const segments: GaugeSegment[] = [
      { colorToken: 'element-data-1', endValue: 0 },
      { colorToken: 'element-data-5', endValue: 50 },
      { colorToken: 'element-data-7', endValue: 100 }
    ];

    beforeEach(() => {
      host.mode.set('single');
      host.min.set(0);
      host.max.set(100);
      host.segments.set(segments);
    });

    it('should render a single data arc', async () => {
      host.series.set([{ value: 60, colorToken: 'element-data-3', name: 'Value' }]);
      await fixture.whenStable();

      expect(getDataPaths()).toHaveLength(1);
    });

    it('should display dash when no series is provided', async () => {
      host.series.set([]);
      await fixture.whenStable();

      expect(getValueText()).toBe('-');
    });
  });

  describe('ticks', () => {
    it('should render ticks with min and max labels', async () => {
      host.min.set(0);
      host.max.set(100);
      await fixture.whenStable();

      const labels = getTickLabels();
      expect(labels).toContain('0');
      expect(labels).toContain('100');
    });

    it('should render zero tick when min is negative', async () => {
      host.min.set(-100);
      host.max.set(100);
      await fixture.whenStable();

      const labels = getTickLabels();
      expect(labels).toContain('-100');
      expect(labels).toContain('0');
      expect(labels).toContain('100');
      expect(labels).toHaveLength(3);
    });

    it('should not render tick paths when showTicks is false', async () => {
      host.series.set(defaultSeries);
      host.showTicks.set(false);
      await fixture.whenStable();

      const tickPaths = getTickPaths();
      for (const path of tickPaths) {
        expect(path).toHaveAttribute('d', '');
      }
    });

    it('should still render tick labels when showTicks is false', async () => {
      host.showTicks.set(false);
      await fixture.whenStable();

      const labels = getTickLabels();
      expect(labels.length).toBeGreaterThan(0);
    });
  });

  describe('legend', () => {
    beforeEach(() => {
      host.series.set(defaultSeries);
    });

    it('should render legend table when showLegend is true', async () => {
      await fixture.whenStable();
      expect(getLegendTable()).toBeInTheDocument();
      expect(getLegendRows()).toHaveLength(2);
    });

    it('should not render legend when showLegend is false', async () => {
      host.showLegend.set(false);
      await fixture.whenStable();

      expect(getLegendTable()).not.toBeInTheDocument();
    });

    it('should display series name and value in legend', async () => {
      await fixture.whenStable();

      const rows = getLegendRows();
      expect(rows[0].querySelector('.name')).toHaveTextContent('Series A');
      expect(rows[0].querySelector('.value')).toHaveTextContent('30');
      expect(rows[1].querySelector('.name')).toHaveTextContent('Series B');
      expect(rows[1].querySelector('.value')).toHaveTextContent('20');
    });

    it('should display description in legend when provided', async () => {
      host.series.set([
        { value: 30, colorToken: 'element-data-7', name: 'Series A', description: 'Some info' }
      ]);
      await fixture.whenStable();

      expect(getLegendRows()[0].querySelector('.descr')).toHaveTextContent('Some info');
    });

    it('should not display description element when not provided', async () => {
      await fixture.whenStable();
      expect(getLegendRows()[0].querySelector('.descr')).not.toBeInTheDocument();
    });

    it('should set host class based on legendPosition row', async () => {
      await fixture.whenStable();
      expect(gaugeEl).toHaveClass('legend-row');
    });

    it('should set host class based on legendPosition column', async () => {
      host.legendPosition.set('column');
      await fixture.whenStable();

      expect(gaugeEl).toHaveClass('legend-column');
    });

    it('should apply data-id on legend rows when provided', async () => {
      host.series.set([{ value: 30, colorToken: 'element-data-7', name: 'A', id: 'row-a' }]);
      await fixture.whenStable();

      expect(getLegendRows()[0]).toHaveAttribute('data-id', 'row-a');
    });
  });

  describe('formatters', () => {
    it('should use custom valueFormatter', async () => {
      host.series.set([{ value: 42.567, colorToken: 'element-data-7', name: 'A' }]);
      host.valueFormatter.set((val: number) => `${val.toFixed(1)} units`);
      await fixture.whenStable();

      expect(getValueText()).toContain('42.6 units');
    });

    it('should use custom axisLabelFormatter for tick labels', async () => {
      host.min.set(0);
      host.max.set(100);
      host.axisLabelFormatter.set((val: number) => `${val}%`);
      await fixture.whenStable();

      const labels = getTickLabels();
      expect(labels).toContain('0%');
      expect(labels).toContain('100%');
    });

    it('should respect minNumberOfDecimals and maxNumberOfDecimals', async () => {
      host.series.set([{ value: 5, colorToken: 'element-data-7', name: 'A' }]);
      host.minNumberOfDecimals.set(2);
      host.maxNumberOfDecimals.set(2);
      await fixture.whenStable();

      expect(getValueText()).toContain('5.00');
    });

    it('should respect axisNumberOfDecimals', async () => {
      host.min.set(0);
      host.max.set(100);
      host.axisNumberOfDecimals.set(1);
      await fixture.whenStable();

      const labels = getTickLabels();
      expect(labels).toContain('0.0');
      expect(labels).toContain('100.0');
    });
  });

  describe('angles', () => {
    it('should adjust SVG height for angles beyond semicircle', async () => {
      host.startAngle.set(-135);
      host.endAngle.set(135);
      await fixture.whenStable();

      const svg = getSvg();
      const height = parseFloat(svg.getAttribute('height')!);
      // For angles > 90, height should be greater than default 60
      expect(height).toBeGreaterThan(60);
    });

    it('should set valignMiddle for angles exceeding semicircle', async () => {
      host.startAngle.set(-135);
      host.endAngle.set(135);
      await fixture.whenStable();

      const valueText = gaugeEl.querySelector('text.value')!;
      expect(valueText).toHaveAttribute('dominant-baseline', 'middle');
    });

    it('should not set valignMiddle for semicircle angles', async () => {
      await fixture.whenStable();
      const valueText = gaugeEl.querySelector('text.value')!;
      expect(valueText).toHaveAttribute('dominant-baseline', 'auto');
    });
  });

  describe('highlight', () => {
    it('should toggle highlight on data arc mouseenter/mouseleave', async () => {
      host.series.set([{ value: 50, colorToken: 'element-data-7', name: 'A' }]);
      await fixture.whenStable();

      const dataPath = getDataPaths()[0];
      expect(dataPath).not.toHaveClass('highlight');

      dataPath.dispatchEvent(new MouseEvent('mouseenter'));
      await fixture.whenStable();
      expect(dataPath).toHaveClass('highlight');

      dataPath.dispatchEvent(new MouseEvent('mouseleave'));
      await fixture.whenStable();
      expect(dataPath).not.toHaveClass('highlight');
    });

    it('should toggle highlight on legend color dot mouseenter/mouseleave', async () => {
      host.series.set([{ value: 50, colorToken: 'element-data-7', name: 'A' }]);
      await fixture.whenStable();

      const colorDot = gaugeEl.querySelector('.legend-table .color') as HTMLElement;
      expect(colorDot).not.toHaveClass('highlight');

      await userEvent.hover(colorDot);
      await fixture.whenStable();
      expect(colorDot).toHaveClass('highlight');

      await userEvent.unhover(colorDot);
      await fixture.whenStable();
      expect(colorDot).not.toHaveClass('highlight');
    });
  });
});
