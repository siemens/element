/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, HostListener } from '@angular/core';
import { EChartOption, SiChartSunburstComponent, SunburstSeriesOption } from '@siemens/charts-ng';
import { SiResizeObserverDirective } from '@siemens/element-ng/resize-observer';

@Component({
  selector: 'app-sample',
  imports: [SiChartSunburstComponent, SiResizeObserverDirective],
  templateUrl: './sunburst.html'
})
export class SampleComponent {
  title = 'Sunburst Chart';
  toolTip = true;
  chartColors: EChartOption = this.createChartColors();

  chartData: SunburstSeriesOption = {
    data: [
      {
        name: 'Category',
        children: [
          {
            name: 'Value 1',
            value: 15,
            children: [
              {
                name: 'Child 1',
                value: 4
              },
              {
                name: 'Child 2',
                value: 5,
                children: [
                  {
                    name: 'Child 3',
                    value: 2
                  }
                ]
              },
              {
                name: 'Child 4',
                value: 4
              }
            ]
          },
          {
            name: 'Value 2',
            value: 10,
            children: [
              {
                name: 'Child 5',
                value: 5
              },
              {
                name: 'Child 6',
                value: 5
              }
            ]
          }
        ]
      }
    ]
  };

  @HostListener('window:theme-switch')
  protected onThemeSwitch(): void {
    this.chartColors = this.createChartColors();
  }

  private createChartColors(): EChartOption {
    const style = window.getComputedStyle(document.documentElement);
    const colors = [
      this.getProperty(style, '--element-data-plum-1', '#e5659b'),
      this.getProperty(style, '--element-data-plum-2', '#c04774'),
      this.getProperty(style, '--element-data-plum-3', '#9f1853'),
      this.getProperty(style, '--element-data-plum-4', '#4f153d')
    ];
    return {
      color: colors
    };
  }

  private getProperty(style: CSSStyleDeclaration, prop: string, defaultValue: string): string {
    const val = style.getPropertyValue(prop);
    return val ? val : defaultValue;
  }
}
