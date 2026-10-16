/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SiChartComponent } from '@siemens/charts-ng/chart';
import { EChartOption } from '@siemens/charts-ng/common';

import { themeElement } from './element';

describe('Element theme tooltip', () => {
  const payload = '<img src=x onerror="alert(1)"> & \'text\'';
  const marker = '<span class="tooltip-marker" style="margin-right: 4px"></span>';

  it.each([
    { name: 'scalar values', value: payload },
    { name: 'array values', value: ['category', payload] }
  ])('should escape labels, names and $name while preserving markers', ({ value }) => {
    const html = themeElement.style().tooltip.formatter({
      axisValueLabel: payload,
      name: payload,
      seriesName: 'Series',
      value,
      encode: { y: [1] },
      marker
    });
    const tooltip = document.createElement('div');
    tooltip.innerHTML = html;

    expect(tooltip.querySelector('img')).toBeNull();
    expect(tooltip.textContent).toBe(payload.repeat(3));
    expect(tooltip.querySelector('.tooltip-marker')).not.toBeNull();
    expect(html).toContain('margin-inline-end: 4px');
  });

  it('should escape series names when the data name matches the axis value', () => {
    const html = themeElement.style().tooltip.formatter({
      name: 'Category',
      axisValue: 'Category',
      seriesName: payload,
      value: 42,
      encode: { y: [0] },
      marker
    });
    const tooltip = document.createElement('div');
    tooltip.innerHTML = html;

    expect(tooltip.querySelector('img')).toBeNull();
    expect(tooltip.textContent).toBe(`${payload}42`);
  });

  it('should escape all candlestick values', () => {
    const html = themeElement.style().tooltip.formatter([
      {
        componentSubType: 'candlestick',
        seriesName: 'Prices',
        value: [payload, payload, payload, payload],
        encode: { y: [0, 1, 2, 3] },
        color: '#000000',
        marker
      }
    ]);
    const tooltip = document.createElement('div');
    tooltip.innerHTML = html;

    expect(tooltip.querySelector('img')).toBeNull();
    expect(tooltip.textContent).toBe(
      `Pricesopen${payload}close${payload}lowest${payload}highest${payload}`
    );
  });

  it('should render a safe candlestick tooltip through the ECharts showTip path', async () => {
    const options: EChartOption = {
      animation: false,
      xAxis: { type: 'category', data: [payload] },
      yAxis: { type: 'value' },
      tooltip: { trigger: 'axis', className: 'test-tooltip', transitionDuration: 0 },
      series: [
        {
          type: 'candlestick',
          name: payload,
          itemStyle: { color: '"/><img src=x onerror=alert(1)>' },
          data: [[1, 2, 0, 3]]
        }
      ]
    };
    const fixture = TestBed.createComponent(SiChartComponent, {
      bindings: [inputBinding('options', () => options)]
    });
    const host: HTMLElement = fixture.nativeElement;
    host.style.cssText = 'display: block; width: 300px; height: 300px';
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.componentInstance.chart.dispatchAction({
      type: 'showTip',
      seriesIndex: 0,
      dataIndex: 0
    });
    await fixture.whenStable();

    await vi.waitFor(() => {
      const tooltip = host.querySelector('.test-tooltip');
      expect(tooltip).not.toBeNull();
      expect(tooltip?.textContent).toBe(`${payload}${payload}open1close2lowest0highest3`);
      expect(tooltip?.querySelector('span')).not.toBeNull();
    });
    expect(host.querySelector('img')).toBeNull();
  });

  it.each([
    { color: '#123456', expected: '#123456' },
    {
      color: `var(--series-color, '"><img src=x onerror=alert(1)>')`,
      expected: `var(--series-color, '"><img src=x onerror=alert(1)>')`
    },
    { color: '"/><img src=x onerror=alert(1)>', expected: 'transparent' },
    { color: 'red;background:url(https://example.com/beacon)', expected: 'transparent' },
    { color: { type: 'linear', colorStops: [] }, expected: 'transparent' }
  ])('should validate candlestick marker color $color', ({ color, expected }) => {
    const html = themeElement.style().tooltip.formatter({
      componentSubType: 'candlestick',
      seriesName: 'Prices',
      value: [1, 2, 3, 4],
      encode: { y: [0, 1, 2, 3] },
      color,
      marker
    });
    const tooltip = document.createElement('div');
    tooltip.innerHTML = html;

    expect(tooltip.querySelector('img')).toBeNull();
    const miniMarkers = tooltip.querySelectorAll('span[style*="background-color:"]');
    expect(miniMarkers).toHaveLength(4);
    for (const miniMarker of miniMarkers) {
      expect(miniMarker.getAttribute('style')).toContain(`background-color:${expected};`);
      expect((miniMarker as HTMLElement).style.backgroundImage).toBe('');
    }
  });

  it.each([null, undefined])('should render %s values as empty text without a marker', value => {
    const html = themeElement.style().tooltip.formatter({
      seriesName: 'Series',
      value,
      encode: { y: [0] }
    });
    const tooltip = document.createElement('div');
    tooltip.innerHTML = html;

    expect(tooltip.textContent).toBe('Series');
  });

  it('should display pre-escaped names literally', () => {
    const html = themeElement.style().tooltip.formatter({
      seriesName: '&amp;',
      value: null,
      encode: { y: [0] }
    });
    const tooltip = document.createElement('div');
    tooltip.innerHTML = html;

    expect(tooltip.textContent).toBe('&amp;');
  });
});
