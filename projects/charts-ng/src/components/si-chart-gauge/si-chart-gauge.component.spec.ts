/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, SimpleChange, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SiChartGaugeComponent } from './si-chart-gauge.component';

@Component({
  imports: [SiChartGaugeComponent],
  template: `<si-chart-gauge
    style="inline-size: 300px; block-size: 300px"
    [minValue]="minValue"
    [maxValue]="maxValue"
    [value]="value"
    [title]="title"
    [subTitle]="subTitle"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
  readonly chartGaugeComponent = viewChild.required(SiChartGaugeComponent);
  minValue!: number;
  maxValue!: number;
  value!: number;
  title?: string;
  subTitle?: string;
}

describe('SiChartGaugeComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();
  });

  const getOption = (component: SiChartGaugeComponent): any => component.chart.getOption() as any;

  const createChartWithTestData = (): any => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const component = fixture.componentInstance;
    component.minValue = 0;
    component.maxValue = 50;
    component.value = 2;
    component.title = 'Chart title';
    component.subTitle = 'Chart subTitle';
    fixture.detectChanges();

    return { fixture, component };
  };

  it('should have a defined component', () => {
    const { component } = createChartWithTestData();
    expect(component).toBeDefined();
  });

  it('should have a defined ECharts chart', () => {
    const { component } = createChartWithTestData();
    expect(component.chartGaugeComponent().chart).toBeDefined();
  });

  it('should update the chart props', () => {
    const { fixture, component } = createChartWithTestData();
    component.title = 'Another chart title';
    component.subTitle = 'Another chart subTitle';
    component.minValue = 20;
    component.maxValue = 100;
    component.chartGaugeComponent().ngOnChanges({
      title: new SimpleChange(null, component.title, false),
      subTitle: new SimpleChange(null, component.subTitle, false)
    });
    fixture.detectChanges();

    const options = getOption(component.chartGaugeComponent());
    expect(options.title[0].text).toEqual('Another chart title');
    expect(options.title[0].subtext).toEqual('Another chart subTitle');
    expect(options.series[0].min).toEqual(20);
    expect(options.series[0].max).toEqual(100);
  });

  it('should set chart value', () => {
    const { component } = createChartWithTestData();
    component.chartGaugeComponent().setValue(5);
    expect(getOption(component.chartGaugeComponent()).series[2].data[0].value).toEqual(5);
  });
});
