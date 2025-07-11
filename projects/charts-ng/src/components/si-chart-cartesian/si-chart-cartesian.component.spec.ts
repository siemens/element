/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, SimpleChange, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { EChartOption } from '../../shared/echarts.model';
import { ChartXAxis, ChartYAxis } from '../si-chart/si-chart.interfaces';
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
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush
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
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();
  });

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
      (component.chartCartesianComponent().chart.getOption() as any).series[0].data.length
    ).toEqual(5);
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

    expect(component.chart.getOption().series.length).toEqual(0);
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
    expect(getOption(component.chartCartesianComponent()).series[0].data.length).toEqual(10);

    component.chartCartesianComponent().addData(0, ['k', 11]);
    expect(getOption(component.chartCartesianComponent()).series[0].data.length).toEqual(10);
  });

  it('should not create legend data by default', async () => {
    const { component } = await createChartWithTestData();
    expect(getOption(component.chartCartesianComponent()).legend[0].data.length).toEqual(0);
  });

  it('should create legend data, if configured', async () => {
    const { component } = await createChartWithTestData(true);
    expect(getOption(component.chartCartesianComponent()).legend[0].data[0].name).toEqual(
      'Test data'
    );
  });
});
