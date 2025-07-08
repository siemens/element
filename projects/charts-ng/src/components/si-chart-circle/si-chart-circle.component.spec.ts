/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, SimpleChange, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { CircleChartSeries } from '../si-chart-circle/si-chart-circle.interface';
import { SiChartCircleComponent } from './si-chart-circle.component';

@Component({
  template: `
    <si-chart-circle
      style="inline-size: 300px; block-size: 300px"
      [series]="series"
      [showLegend]="showLegend"
      [title]="title"
      [subTitle]="subTitle"
    />
  `,
  imports: [SiChartCircleComponent]
})
class TestHostComponent {
  readonly chartCircleComponent = viewChild.required(SiChartCircleComponent);
  series?: CircleChartSeries[];
  showLegend!: boolean;
  title?: string;
  subTitle?: string;
}
describe('SiChartCircleComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();
  });

  const getOption = (component: SiChartCircleComponent): any => component.chart.getOption() as any;

  const createChartWithTestData = async (showLegend = false): Promise<any> => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const component = fixture.componentInstance;

    component.series = [
      {
        name: 'Test data',
        data: [
          {
            value: 10
          },
          {
            value: 20
          },
          {
            value: 30
          },
          {
            value: 40
          }
        ]
      }
    ];

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
    expect(component.chartCircleComponent().chart).toBeDefined();
  });

  it('should update the chart props', async () => {
    const { fixture, component } = await createChartWithTestData();
    component.title = 'Another chart title';
    component.subTitle = 'Another chart subTitle';
    component.chartCircleComponent().ngOnChanges({
      title: new SimpleChange(null, component.title, false),
      subTitle: new SimpleChange(null, component.subTitle, false)
    });
    fixture.detectChanges();

    const titles = getOption(component.chartCircleComponent()).title;
    expect(titles[0].text).toEqual('Another chart title');
    expect(titles[0].subtext).toEqual('Another chart subTitle');
  });

  it('should change single chart value', async () => {
    const { component } = await createChartWithTestData();

    component.chartCircleComponent().changeSingleValue(0, 0, 21);
    expect(getOption(component.chartCircleComponent()).series[0].data[0].value).toEqual(21);
  });

  it('should change multiple chart values', async () => {
    const { component } = await createChartWithTestData();

    component.chartCircleComponent().changeMultiValues([
      { seriesIndex: 0, valueIndex: 2, value: 33 },
      { seriesIndex: 0, valueIndex: 3, value: 44 }
    ]);
    expect(getOption(component.chartCircleComponent()).series[0].data[2].value).toEqual(33);
    expect(getOption(component.chartCircleComponent()).series[0].data[3].value).toEqual(44);
  });

  it('should have an empty series, when no series data provided', () => {
    const fixture = TestBed.createComponent(SiChartCircleComponent);
    const component = fixture.debugElement.componentInstance;
    fixture.detectChanges();

    expect(component.chart.getOption().series.length).toEqual(0);
  });
});
