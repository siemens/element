/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component } from '@angular/core';
import { EChartOption, SiChartComponent } from '@siemens/charts-ng';
import { SiResizeObserverDirective } from '@siemens/element-ng/resize-observer';

@Component({
  selector: 'app-sample',
  templateUrl: './chart.html',
  imports: [SiChartComponent, SiResizeObserverDirective]
})
export class SampleComponent {
  chartColors: EChartOption = {};
  chartData: EChartOption = {
    title: {
      text: 'Generic custom chart'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: [
      {
        icon: 'circle',
        left: '41',
        data: ['Occupancy', 'Electricity', 'Water', 'Heating'],
        selected: {}
      }
    ],
    xAxis: [
      {
        type: 'category',
        splitLine: {
          show: true
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
        splitLine: {
          show: false
        },
        axisLabel: {
          formatter: '{value} KW'
        }
      },
      {
        type: 'value',
        min: 0,
        max: 25,
        position: 'left',
        splitLine: {
          show: false
        },
        axisLabel: {
          formatter: '{value}'
        }
      }
    ],
    series: [
      {
        name: 'Occupancy',
        type: 'bar',
        barWidth: 15,
        data: [2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3]
      },
      {
        name: 'Electricity',
        type: 'line',
        yAxisIndex: 1,
        data: [3.0, 2.2, 3.0, 4.5, 6.3, 10.2, 20.3, 23.4, 23.0, 16.5, 12.0, 6.2]
      },
      {
        name: 'Water',
        type: 'line',
        yAxisIndex: 1,
        data: [5.0, 4, 3.5, 7.5, 3.3, 8.2, 12.3, 10.4, 18.0, 13.5, 8.0, 9.2]
      },
      {
        name: 'Heating',
        type: 'line',
        yAxisIndex: 1,
        data: [7, 6, 4.5, 8, 9, 8, 13, 16, 10, 8, 13, 7]
      }
    ]
  };
}
