/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, SimpleChange, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SiChartProgressBarComponent } from './si-chart-progress-bar.component';
import { ProgressBarChartSeries } from './si-chart-progress-bar.interface';

@Component({
  imports: [SiChartProgressBarComponent],
  template: `<si-chart-progress-bar
    style="inline-size: 300px; block-size: 300px"
    [series]="series"
    [showLegend]="showLegend"
    [title]="title"
    [subTitle]="subTitle"
    [labelPosition]="labelPosition"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
  readonly chartProgressBarComponent = viewChild.required(SiChartProgressBarComponent);
  series?: ProgressBarChartSeries[];
  showLegend!: boolean;
  title?: string;
  subTitle?: string;
  labelPosition?: string;
}
describe('SiChartProgressBarComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();
  });

  const getOption = (component: TestHostComponent): any =>
    component.chartProgressBarComponent().chart.getOption() as any;

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
    component.labelPosition = 'top';

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
    expect(component.chartProgressBarComponent().chart).toBeDefined();
  });

  it('should update the chart props', async () => {
    const { fixture, component } = await createChartWithTestData();
    component.title = 'Another chart title';
    component.chartProgressBarComponent().ngOnChanges({
      title: new SimpleChange(null, component.title, false)
    });
    fixture.detectChanges();

    const titles = getOption(component).title;
    expect(titles[0].text).toEqual('Another chart title');
  });

  it('should change single chart value', async () => {
    const { component } = await createChartWithTestData();

    component.chartProgressBarComponent().changeSingleValue(1, 80);
    expect(getOption(component).series[0].data[1]).toEqual(80);
  });

  it('should change multiple chart values', async () => {
    const { component } = await createChartWithTestData();

    component.chartProgressBarComponent().changeMultiValues([
      { valueIndex: 2, value: 11 },
      { valueIndex: 4, value: 99 }
    ]);
    expect(getOption(component).series[0].data[2]).toEqual(11);
    expect(getOption(component).series[0].data[4]).toEqual(99);
  });

  it('should have an empty series, when no series data provided', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(getOption(component).series.length).toEqual(0);
  });
});
