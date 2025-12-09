/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, input } from '@angular/core';
import { SiChartBaseComponent, SunburstSeriesOption, echarts } from '@siemens/charts-ng/common';
import { SiCustomLegendComponent } from '@siemens/charts-ng/custom-legend';
import { SiChartLoadingSpinnerComponent } from '@siemens/charts-ng/loading-spinner';
import { SunburstChart } from 'echarts/charts';

echarts.use([SunburstChart]);

@Component({
  selector: 'si-chart-sunburst',
  imports: [SiCustomLegendComponent, SiChartLoadingSpinnerComponent],
  templateUrl: '../common/si-chart-base.component.html',
  styleUrl: '../common/si-chart-base.component.scss'
})
export class SiChartSunburstComponent extends SiChartBaseComponent {
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
