/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, HostListener } from '@angular/core';
import { EChartOption, SiChartComponent } from '@siemens/charts-ng';
import { SiResizeObserverDirective } from '@siemens/element-ng/resize-observer';

@Component({
  selector: 'app-sample',
  templateUrl: './chart.html',
  imports: [SiChartComponent, SiResizeObserverDirective]
})
export class SampleComponent {
  chartColors: EChartOption = this.createChartColors();

  chartData: EChartOption = {
    title: {
      text: 'Generic chart'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: [
      {
        left: '10',
        data: ['Average Temperature']
      },
      {
        right: '20',
        data: ['Evaporation', 'Precipitation']
      }
    ],
    xAxis: [
      {
        type: 'category',
        axisTick: {
          alignWithLabel: true
        },
        data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      }
    ],
    yAxis: [
      {
        type: 'value',
        min: 0,
        max: 250,
        position: 'right',
        axisLabel: {
          formatter: '{value} ml'
        }
      },
      {
        type: 'value',
        min: 0,
        max: 25,
        position: 'left',
        axisLabel: {
          formatter: '{value} °C'
        }
      }
    ],
    series: [
      {
        name: 'Evaporation',
        type: 'bar',
        data: [2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3]
      },
      {
        name: 'Precipitation',
        type: 'bar',
        data: [2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3]
      },
      {
        name: 'Average Temperature',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        areaStyle: undefined,
        data: [2.0, 2.2, NaN, 4.5, 6.3, 10.2, 20.3, 23.4, 23.0, 16.5, 12.0, 6.2],
        markArea: {
          data: [[{ xAxis: 'Feb' }, { xAxis: 'Apr' }]]
        }
      }
    ]
  };

  private createChartColors(): EChartOption {
    const style = window.getComputedStyle(document.documentElement);
    const colors = [
      this.getProp(style, '--element-data-plum-1', '#e5659b'),
      this.getProp(style, '--element-data-plum-2', '#c04774'),
      this.getProp(style, '--element-data-plum-3', '#9f1853'),
      this.getProp(style, '--element-data-plum-4', '#4f153d')
    ];
    return {
      color: colors
    };
  }

  @HostListener('window:theme-switch')
  protected onThemeSwitch(): void {
    this.chartColors = this.createChartColors();
  }

  private getProp(style: CSSStyleDeclaration, prop: string, defaultValue: string): string {
    const val = style.getPropertyValue(prop);
    return val ? val : defaultValue;
  }
}
