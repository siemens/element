/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, input } from '@angular/core';
import { SiChartComponent } from '@siemens/charts-ng/chart';
import { SunburstSeriesOption, echarts } from '@siemens/charts-ng/common';
import { SiCustomLegendComponent } from '@siemens/charts-ng/custom-legend';
import { SiChartLoadingSpinnerComponent } from '@siemens/charts-ng/loading-spinner';
import { SunburstChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent } from 'echarts/components';

echarts.use([SunburstChart, TitleComponent, TooltipComponent]);

@Component({
  selector: 'si-chart-sunburst',
  imports: [SiCustomLegendComponent, SiChartLoadingSpinnerComponent],
  templateUrl: '../chart/si-chart.component.html',
  styleUrl: '../chart/si-chart.component.scss'
})
export class SiChartSunburstComponent extends SiChartComponent {
  /** The series for the chart. */
  readonly series = input<SunburstSeriesOption>();
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
      series: series ? [{ type: 'sunburst', ...series }] : [],
      tooltip: { show: this.toolTip() || this.tooltip() }
    };

    this.applyTitles();
  }
}
