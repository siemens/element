/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, HostListener } from '@angular/core';
import { EChartOption, SankeySeriesOption, SiChartSankeyComponent } from '@siemens/charts-ng';
import { SiResizeObserverDirective } from '@siemens/element-ng/resize-observer';

@Component({
  selector: 'app-sample',
  imports: [SiChartSankeyComponent, SiResizeObserverDirective],
  templateUrl: './sankey.html'
})
export class SampleComponent {
  title = 'Sankey Chart';
  toolTip = true;
  chartColors: EChartOption = this.createChartColors();

  chartData: SankeySeriesOption = {
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

  @HostListener('window:theme-switch')
  protected onThemeSwitch(): void {
    this.chartColors = this.createChartColors();
  }

  private createChartColors(): EChartOption {
    const style = window.getComputedStyle(document.documentElement);
    const colors = [
      this.getProperty(style, '--element-data-plum-1', '#e5659b'),
      this.getProperty(style, '--element-data-plum-2', '#c04774')
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
