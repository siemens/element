/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, SimpleChange, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SiChartProgressComponent } from './si-chart-progress.component';
import { ProgressChartSeries } from './si-chart-progress.interface';

@Component({
  imports: [SiChartProgressComponent],
  template: `<si-chart-progress
    style="inline-size: 300px; block-size: 300px"
    [series]="series"
    [showLegend]="showLegend"
    [title]="title"
    [subTitle]="subTitle"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
  readonly chartProgressComponent = viewChild.required(SiChartProgressComponent);
  series?: ProgressChartSeries[];
  showLegend!: boolean;
  title?: string;
  subTitle?: string;
}
describe('SiChartProgressComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();
  });

  const getOption = (component: TestHostComponent): any =>
    component.chartProgressComponent().chart.getOption() as any;

  const createChartWithTestData = async (showLegend = false): Promise<any> => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const component = fixture.componentInstance;

    component.series = [
      {
        name: 'Monday',
        percent: 10
      },
      {
        name: 'Tuesday',
        percent: 20
      },
      {
        name: 'Wednesday',
        percent: 30
      },
      {
        name: 'Thursday',
        percent: 40
      },
      {
        name: 'Friday',
        percent: 70
      }
    ];

    component.showLegend = showLegend;
    component.title = 'Chart title';
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
    expect(component.chartProgressComponent().chart).toBeDefined();
  });

  it('should update the chart props', async () => {
    const { fixture, component } = await createChartWithTestData();
    component.title = 'Another chart title';
    component.chartProgressComponent().ngOnChanges({
      title: new SimpleChange(null, component.title, false)
    });
    fixture.detectChanges();

    const titles = getOption(component).title;
    expect(titles[0].text).toEqual('Another chart title');
  });

  it('should change single chart value', async () => {
    const { component } = await createChartWithTestData();

    component.chartProgressComponent().changeSingleValue(0, 80);
    expect(getOption(component).series[0].realValue).toEqual(80);
  });

  it('should change multiple chart values', async () => {
    const { component } = await createChartWithTestData();

    component.chartProgressComponent().changeMultiValues([
      { seriesIndex: 3, percent: 55 },
      { seriesIndex: 4, percent: 66 }
    ]);
    expect(getOption(component).series[3].realValue).toEqual(55);
    expect(getOption(component).series[4].realValue).toEqual(66);
  });

  it('should have an empty series, when no series data provided', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(getOption(component).series.length).toEqual(0);
  });
});
