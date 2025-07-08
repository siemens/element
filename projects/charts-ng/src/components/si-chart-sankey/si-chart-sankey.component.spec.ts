/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, SimpleChange, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SankeySeriesOption } from '../../shared/echarts.model';
import { SiChartSankeyComponent } from './si-chart-sankey.component';

@Component({
  template: `
    <si-chart-sankey
      style="inline-size: 300px; block-size: 300px"
      [series]="series"
      [title]="title"
      [subTitle]="subTitle"
    />
  `,
  imports: [SiChartSankeyComponent]
})
class TestHostComponent {
  readonly chartSankeyComponent = viewChild.required(SiChartSankeyComponent);
  series?: SankeySeriesOption;
  title?: string;
  subTitle?: string;
}
describe('SiChartSankeyComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();
  });

  const getOption = (component: SiChartSankeyComponent): any => component.chart.getOption() as any;

  const createChartWithTestData = async (): Promise<any> => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const component = fixture.componentInstance;

    component.series = {
      data: [
        {
          name: 'Value A'
        },
        {
          name: 'Value B'
        },
        {
          name: 'Value C'
        }
      ],
      links: [
        {
          source: 'Value A',
          target: 'Value B',
          value: 5
        },
        {
          source: 'Value A',
          target: 'Value C',
          value: 3
        },
        {
          source: 'Value B',
          target: 'Value C',
          value: 8
        }
      ],
      label: {
        formatter: '{b}: {c}'
      },
      lineStyle: {
        color: 'source'
      },
      edgeLabel: {
        formatter: '{c}'
      },
      draggable: true
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
    expect(component.chartSankeyComponent().chart).toBeDefined();
  });

  it('should update the chart props', async () => {
    const { fixture, component } = await createChartWithTestData();
    component.title = 'Another chart title';
    component.subTitle = 'Another chart subTitle';
    component.chartSankeyComponent().ngOnChanges({
      title: new SimpleChange(null, component.title, false),
      subTitle: new SimpleChange(null, component.subTitle, false)
    });
    fixture.detectChanges();

    const titles = getOption(component.chartSankeyComponent()).title;
    expect(titles[0].text).toEqual('Another chart title');
    expect(titles[0].subtext).toEqual('Another chart subTitle');
  });

  it('should have an empty series, when no series data provided', () => {
    const fixture = TestBed.createComponent(SiChartSankeyComponent);
    const component = fixture.debugElement.componentInstance;
    fixture.detectChanges();

    expect(component.chart.getOption().series.length).toBe(0);
  });
});
