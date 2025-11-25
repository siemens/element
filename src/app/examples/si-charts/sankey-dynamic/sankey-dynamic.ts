/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, HostListener } from '@angular/core';
import { EChartOption, SiChartComponent } from '@siemens/charts-ng';
import { SiResizeObserverDirective } from '@siemens/element-ng/resize-observer';

@Component({
  selector: 'app-sample',
  imports: [SiChartComponent, SiResizeObserverDirective],
  templateUrl: './sankey-dynamic.html'
})
export class SampleComponent {
  title = 'Sankey Chart - Dynamic Loading Example';
  chartColors: EChartOption = this.createChartColors();

  /**
   * Using SiChartComponent with type: 'sankey' to demonstrate dynamic loading.
   * The Sankey chart type will be loaded dynamically when the component detects
   * series.type === 'sankey' in the options.
   */
  sankeyOptions: EChartOption = this.createSankeyOptions();

  @HostListener('window:theme-switch')
  protected onThemeSwitch(): void {
    this.chartColors = this.createChartColors();
    this.sankeyOptions = this.createSankeyOptions();
  }

  private createSankeyOptions(): EChartOption {
    return {
      ...this.chartColors,
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove'
      },
      series: [
        {
          type: 'sankey', // This triggers dynamic import of SankeyChart
          data: [
            { name: 'Product A' },
            { name: 'Product B' },
            { name: 'Manufacturing' },
            { name: 'Assembly' },
            { name: 'Quality Check' },
            { name: 'Warehouse' },
            { name: 'Distribution' }
          ],
          links: [
            { source: 'Product A', target: 'Manufacturing', value: 120 },
            { source: 'Product B', target: 'Manufacturing', value: 80 },
            { source: 'Manufacturing', target: 'Assembly', value: 150 },
            { source: 'Manufacturing', target: 'Quality Check', value: 50 },
            { source: 'Assembly', target: 'Quality Check', value: 150 },
            { source: 'Quality Check', target: 'Warehouse', value: 180 },
            { source: 'Quality Check', target: 'Distribution', value: 20 },
            { source: 'Warehouse', target: 'Distribution', value: 180 }
          ],
          label: {
            formatter: '{b}: {c}'
          },
          lineStyle: {
            color: 'source',
            curveness: 0.5
          },
          emphasis: {
            focus: 'adjacency'
          },
          edgeLabel: {
            formatter: '{c}'
          },
          draggable: true,
          layoutIterations: 32
        }
      ]
    };
  }

  private createChartColors(): EChartOption {
    const style = window.getComputedStyle(document.documentElement);
    const colors = [
      this.getProperty(style, '--element-data-plum-1', '#e5659b'),
      this.getProperty(style, '--element-data-plum-2', '#c04774'),
      this.getProperty(style, '--element-data-blue-1', '#4da6ff'),
      this.getProperty(style, '--element-data-blue-2', '#0080ff'),
      this.getProperty(style, '--element-data-green-1', '#66cc66'),
      this.getProperty(style, '--element-data-green-2', '#339933')
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
