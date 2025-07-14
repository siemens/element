/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, SimpleChange, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SunburstSeriesOption } from '../../shared/echarts.model';
import { SiChartSunburstComponent } from './si-chart-sunburst.component';

@Component({
  imports: [SiChartSunburstComponent],
  template: `
    <si-chart-sunburst
      style="inline-size: 300px; block-size: 300px"
      [series]="series"
      [title]="title"
      [subTitle]="subTitle"
    />
  `
})
class TestHostComponent {
  readonly chartSunburstComponent = viewChild.required(SiChartSunburstComponent);
  series?: SunburstSeriesOption;
  title?: string;
  subTitle?: string;
}

describe('SiChartSunburstComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();
  });

  const getOption = (component: SiChartSunburstComponent): any =>
    component.chart.getOption() as any;

  const createChartWithTestData = async (): Promise<any> => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const component = fixture.componentInstance;

    component.series = {
      data: [
        {
          name: 'Category',
          children: [
            {
              name: 'Sub Category 1',
              value: 15,
              children: [
                {
                  name: 'Data 1',
                  value: 4
                },
                {
                  name: 'Data 2',
                  value: 5,
                  children: [
                    {
                      name: 'Value 1',
                      value: 2
                    }
                  ]
                },
                {
                  name: 'Data 3',
                  value: 4
                }
              ]
            },
            {
              name: 'Sub Category 2',
              value: 10,
              children: [
                {
                  name: 'Data 4',
                  value: 5
                },
                {
                  name: 'Data 5',
                  value: 5
                }
              ]
            }
          ]
        }
      ]
    };

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
    expect(component.chartSunburstComponent().chart).toBeDefined();
  });

  it('should update the chart props', async () => {
    const { fixture, component } = await createChartWithTestData();
    component.title = 'Another chart title';
    component.subTitle = 'Another chart subTitle';
    component.chartSunburstComponent().ngOnChanges({
      title: new SimpleChange(null, component.title, false),
      subTitle: new SimpleChange(null, component.subTitle, false)
    });
    fixture.detectChanges();

    const titles = getOption(component.chartSunburstComponent()).title;
    expect(titles[0].text).toEqual('Another chart title');
    expect(titles[0].subtext).toEqual('Another chart subTitle');
  });

  it('should have updated the correct value', async () => {
    const { component } = await createChartWithTestData();
    expect(
      getOption(component.chartSunburstComponent()).series[0].data[0].children[0].value
    ).toEqual(15);
  });

  it('should have an empty series, when no series data provided', () => {
    const fixture = TestBed.createComponent(SiChartSunburstComponent);
    const component = fixture.debugElement.componentInstance;
    fixture.detectChanges();
    expect(component.chart.getOption().series.length).toBe(0);
  });
});
