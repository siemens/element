/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import {
  EChartOption,
  SiChartComponent,
  themeElement,
  themeSupport
} from '@spike-rabbit/charts-ng';
import { SiResizeObserverDirective } from '@spike-rabbit/element-ng/resize-observer';

themeSupport.setDefault(themeElement);

@Component({
  selector: 'app-sample',
  imports: [SiChartComponent, SiResizeObserverDirective],
  templateUrl: './si-chart-generic.html',
  host: { class: 'p-5' }
})
export class SampleComponent {
  public genericChartOptions: EChartOption = {
    color: ['#66CAEC', '#006486', '#FA848C'],
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
        data: [2.0, 2.2, 0, 4.5, 6.3, 10.2, 20.3, 23.4, 23.0, 16.5, 12.0, 6.2],
        markArea: {
          data: [[{ xAxis: 'Feb' }, { xAxis: 'Apr' }]]
        }
      }
    ]
  };
}
