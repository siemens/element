/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { echarts } from '../../shared/echarts.custom';
import { EChartOption } from '../../shared/echarts.model';
import { SiChartComponent } from './si-chart.component';

@Component({
  imports: [SiChartComponent],
  template: `<si-chart style="inline-size: 300px; block-size: 300px" [options]="options" />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestHostComponent {
  readonly chartComponent = viewChild.required(SiChartComponent);
  options!: EChartOption;
}
describe('SiChart', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('should create the chart component', waitForAsync(() => {
      expect(component).toBeTruthy();
    }));
  });

  describe('data handling', () => {
    beforeEach(() => {
      component.options = {
        xAxis: {
          type: 'value'
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            type: 'line',
            name: 'UnitTestData',
            data: [
              ['a', 1],
              ['b', 2],
              ['c', 3],
              ['d', 4]
            ]
          }
        ]
      };
    });

    it('should have existing chart object', () => {
      fixture.detectChanges();
      expect(component.chartComponent().chart).toBeDefined();
    });

    it('should dispose chart on component destruction', () => {
      fixture.detectChanges();
      const chart = component.chartComponent().chart as echarts.ECharts;
      fixture.destroy();

      expect(chart.isDisposed()).toBeTruthy();
    });

    it('should have one series with four items', () => {
      fixture.detectChanges();
      const options: any = component.chartComponent().getOptionNoClone();

      expect(options).toBeDefined();
      expect(options.series.length).toEqual(1);
      expect(options.series[0].data.length).toEqual(4);
    });
  });
});
