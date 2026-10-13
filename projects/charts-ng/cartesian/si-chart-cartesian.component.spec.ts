/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, inputBinding, SimpleChange, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ChartXAxis, ChartYAxis, EChartOption } from '@siemens/charts-ng/common';

import { SiChartCartesianComponent } from './si-chart-cartesian.component';
import { CartesianChartSeries } from './si-chart-cartesian.interfaces';

@Component({
  imports: [SiChartCartesianComponent],
  template: `<si-chart-cartesian
    style="inline-size: 300px; block-size: 300px"
    [options]="options"
    [yAxis]="yAxis"
    [xAxis]="xAxis"
    [series]="series"
    [maxEntries]="maxEntries"
    [showLegend]="showLegend"
    [title]="title"
    [subTitle]="subTitle"
  />`
})
class TestHostComponent {
  readonly chartCartesianComponent = viewChild.required(SiChartCartesianComponent);
  options!: EChartOption;
  yAxis?: ChartYAxis;
  xAxis?: ChartXAxis;
  series?: CartesianChartSeries[];
  maxEntries = 10;
  showLegend!: boolean;
  title?: string;
  subTitle?: string;
}
describe('SiChartBarLineComponent', () => {
  const payload = '<img src=x onerror="alert(1)"> & \'text\'';
  const colorPayload = '"/><img src=x onerror=alert(1)>';

  const getOption = (component: SiChartCartesianComponent): any =>
    component.chart.getOption() as any;

  const createChartWithTestData = async (showLegend = false): Promise<any> => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const component = fixture.componentInstance;

    component.xAxis = { type: 'value' };
    component.yAxis = { type: 'value' };

    component.series = [
      {
        type: 'bar',
        name: 'Test data',
        data: [
          ['a', 1],
          ['b', 2],
          ['c', 3],
          ['d', 4]
        ]
      }
    ];

    component.maxEntries = 10;
    component.showLegend = showLegend;
    component.title = 'Chart title';
    component.subTitle = 'Chart subTitle';
    fixture.detectChanges();
    await fixture.whenStable();
    return { fixture, component };
  };

  it('should have a defined component', async () => {
    const { component } = await createChartWithTestData();
    expect(component).toBeDefined();
  });

  it.each([
    { name: 'scalar values', dataName: payload, value: payload, expectedValue: payload },
    {
      name: 'array values',
      dataName: payload,
      value: ['category', payload],
      expectedValue: payload
    },
    { name: 'series name fallback', dataName: 'category', value: 42, expectedValue: '42' }
  ])(
    'should escape tooltip labels, names and $name with custom markers',
    async ({ dataName, value, expectedValue }) => {
      const fixture = TestBed.createComponent(SiChartCartesianComponent, {
        bindings: [
          inputBinding('xAxis', () => ({ type: 'category', data: ['category'] })),
          inputBinding('yAxis', () => ({ type: 'value' })),
          inputBinding('series', () => [
            { type: 'line', name: payload, symbol: 'diamond', data: [42] }
          ])
        ]
      });
      fixture.detectChanges();
      await fixture.whenStable();
      const options = fixture.componentInstance.chart.getOption() as {
        tooltip: { formatter: (params: object | object[]) => string }[];
      };
      const html = options.tooltip[0].formatter([
        {
          axisValueLabel: payload,
          name: dataName,
          axisValue: 'category',
          seriesName: payload,
          value,
          encode: { y: [1] }
        }
      ]);
      const tooltip = document.createElement('div');
      tooltip.innerHTML = html;

      expect(tooltip.querySelector('img')).toBeNull();
      expect(tooltip.firstChild?.textContent).toBe(payload);
      expect(Array.from(tooltip.querySelectorAll('span'), span => span.textContent)).toEqual([
        payload,
        expectedValue
      ]);
      expect(tooltip.querySelector('svg path')).not.toBeNull();
    }
  );

  it.each([
    { color: '#123456', expected: '#123456' },
    {
      color: `var(--series-color, '"><img src=x onerror=alert(1)>')`,
      expected: `var(--series-color, '"><img src=x onerror=alert(1)>')`
    },
    { color: colorPayload, expected: 'transparent' },
    { color: 'red;background:url(https://example.com/beacon)', expected: 'transparent' },
    {
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 1,
        y2: 0,
        colorStops: [
          { offset: 0, color: 'red' },
          { offset: 1, color: 'blue' }
        ]
      },
      expected: 'transparent'
    }
  ])('should validate custom SVG marker color $color', async ({ color, expected }) => {
    const fixture = TestBed.createComponent(SiChartCartesianComponent, {
      bindings: [
        inputBinding('xAxis', () => ({ type: 'category', data: ['category'] })),
        inputBinding('yAxis', () => ({ type: 'value' })),
        inputBinding('series', () => [
          {
            type: 'line',
            name: payload,
            symbol: 'diamond',
            itemStyle: { color },
            data: [42]
          }
        ])
      ]
    });
    fixture.detectChanges();
    await fixture.whenStable();
    const tooltip = document.createElement('div');
    tooltip.innerHTML = fixture.componentInstance.getSeriesMarkerSvg(payload);

    expect(tooltip.querySelector('img')).toBeNull();
    expect(tooltip.querySelector('svg path')?.getAttribute('fill')).toBe(expected);
  });

  it('should render a safe tooltip through the ECharts showTip path', async () => {
    const fixture = TestBed.createComponent(SiChartCartesianComponent, {
      bindings: [
        inputBinding('xAxis', () => ({ type: 'category', data: [payload] })),
        inputBinding('yAxis', () => ({ type: 'value' })),
        inputBinding('series', () => [
          {
            type: 'line',
            name: payload,
            symbol: 'diamond',
            itemStyle: { color: colorPayload },
            data: [{ name: payload, value: 42 }]
          }
        ])
      ]
    });
    const host: HTMLElement = fixture.nativeElement;
    host.style.cssText = 'display: block; width: 300px; height: 300px';
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.componentInstance.chart.setOption({
      animation: false,
      tooltip: { className: 'test-tooltip', transitionDuration: 0 }
    });
    fixture.componentInstance.chart.dispatchAction({
      type: 'showTip',
      seriesIndex: 0,
      dataIndex: 0
    });
    await fixture.whenStable();

    await vi.waitFor(() => {
      const tooltip = host.querySelector('.test-tooltip');
      expect(tooltip).not.toBeNull();
      expect(tooltip?.textContent).toContain(payload);
      expect(tooltip?.textContent).toContain('42');
      expect(tooltip?.querySelector('svg path')?.getAttribute('fill')).toBe('transparent');
    });
    expect(host.querySelector('img')).toBeNull();
  });

  it('should have a defined ECharts chart', async () => {
    const { component } = await createChartWithTestData();
    expect(component.chartCartesianComponent().chart).toBeDefined();
  });

  it('should update the chart props', async () => {
    const { fixture, component } = await createChartWithTestData();
    component.title = 'Another chart title';
    component.subTitle = 'Another chart subTitle';
    component.chartCartesianComponent().ngOnChanges({
      title: new SimpleChange(null, component.title, false),
      subTitle: new SimpleChange(null, component.subTitle, false)
    });
    fixture.detectChanges();

    const titles = getOption(component.chartCartesianComponent()).title;
    expect(titles[0].text).toEqual('Another chart title');
    expect(titles[0].subtext).toEqual('Another chart subTitle');
  });

  it('should add chart series data', async () => {
    const { component } = await createChartWithTestData();

    component.chartCartesianComponent().addData(0, ['e', 5]);
    expect(
      (component.chartCartesianComponent().chart.getOption() as any).series[0].data
    ).toHaveLength(5);
  });

  it('should have undefined x- and y-Axis, when no input provided', () => {
    const fixture = TestBed.createComponent(SiChartCartesianComponent);
    const component = fixture.debugElement.componentInstance;
    fixture.detectChanges();

    expect(component.chart.getOption().xAxis).toBeUndefined();
    expect(component.chart.getOption().yAxis).toBeUndefined();
  });

  it('should have an empty series, when no series data provided', () => {
    const fixture = TestBed.createComponent(SiChartCartesianComponent);
    const component = fixture.debugElement.componentInstance;
    fixture.detectChanges();

    expect(component.chart.getOption().series).toHaveLength(0);
  });

  it('should have a default number for visible entries', () => {
    const fixture = TestBed.createComponent(SiChartCartesianComponent);
    const component = fixture.debugElement.componentInstance;
    fixture.detectChanges();

    expect(component.visibleEntries()).toEqual(-1);
  });

  it('should limit entries correctly', async () => {
    const { component } = await createChartWithTestData();

    component.chartCartesianComponent().addData(0, ['e', 5]);
    component.chartCartesianComponent().addData(0, ['f', 6]);
    component.chartCartesianComponent().addData(0, ['g', 7]);
    component.chartCartesianComponent().addData(0, ['h', 8]);
    component.chartCartesianComponent().addData(0, ['i', 9]);
    component.chartCartesianComponent().addData(0, ['j', 10]);
    expect(getOption(component.chartCartesianComponent()).series[0].data).toHaveLength(10);

    component.chartCartesianComponent().addData(0, ['k', 11]);
    expect(getOption(component.chartCartesianComponent()).series[0].data).toHaveLength(10);
  });

  it('should not create legend data by default', async () => {
    const { component } = await createChartWithTestData();
    expect(getOption(component.chartCartesianComponent()).legend[0].data).toHaveLength(0);
  });

  it('should create legend data, if configured', async () => {
    const { component } = await createChartWithTestData(true);
    expect(getOption(component.chartCartesianComponent()).legend[0].data[0].name).toEqual(
      'Test data'
    );
  });
});
