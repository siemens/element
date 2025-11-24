/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, input } from '@angular/core';
import { SiCustomLegendComponent } from '@siemens/charts-ng/custom-legend';

import { SunburstSeriesOption } from '../../shared/echarts.model';
import { SiChartLoadingSpinnerComponent } from '../si-chart-loading-spinner/si-chart-loading-spinner.component';
import { SiChartComponent } from '../si-chart/si-chart.component';

@Component({
  selector: 'si-chart-sunburst',
  imports: [SiCustomLegendComponent, SiChartLoadingSpinnerComponent],
  templateUrl: '../si-chart/si-chart.component.html',
  styleUrl: '../si-chart/si-chart.component.scss'
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
