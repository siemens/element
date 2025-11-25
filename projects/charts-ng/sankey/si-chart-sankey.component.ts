/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, input } from '@angular/core';
import { SiChartComponent } from '@siemens/charts-ng/chart';
import { SankeySeriesOption, echarts } from '@siemens/charts-ng/common';
import { SiCustomLegendComponent } from '@siemens/charts-ng/custom-legend';
import { SiChartLoadingSpinnerComponent } from '@siemens/charts-ng/loading-spinner';
import { SankeyChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent } from 'echarts/components';

echarts.use([SankeyChart, TitleComponent, TooltipComponent, GridComponent]);

@Component({
  selector: 'si-chart-sankey',
  imports: [SiCustomLegendComponent, SiChartLoadingSpinnerComponent],
  templateUrl: '../chart/si-chart.component.html',
  styleUrl: '../chart/si-chart.component.scss'
})
export class SiChartSankeyComponent extends SiChartComponent {
  /** The series for the chart. */
  readonly series = input<SankeySeriesOption>();
  /**
   * @deprecated Use `tooltip` instead.
   * @defaultValue false
   */
  readonly toolTip = input(false);
  /** @defaultValue false */
  readonly tooltip = input(false);

  protected override applyOptions(): void {
    const series = this.series();
    this.actualOptions = {
      series: series ? [{ type: 'sankey', ...series }] : [],
      tooltip: { show: this.toolTip() || this.tooltip() }
    };

    this.applyTitles();
  }
}
