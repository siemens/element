/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, input } from '@angular/core';

import { SunburstSeriesOption } from '../../shared/echarts.model';
import { SiChartLoadingSpinnerComponent } from '../si-chart-loading-spinner/si-chart-loading-spinner.component';
import { SiChartComponent } from '../si-chart/si-chart.component';
import { SiCustomLegendComponent } from '../si-custom-legend/si-custom-legend.component';

@Component({
  selector: 'si-chart-sunburst',
  imports: [SiCustomLegendComponent, SiChartLoadingSpinnerComponent],
  templateUrl: '../si-chart/si-chart.component.html',
  styleUrl: '../si-chart/si-chart.component.scss'
})
export class SiChartSunburstComponent extends SiChartComponent {
  readonly series = input<SunburstSeriesOption>();
  /** @defaultValue false */
  readonly toolTip = input(false);

  protected override applyOptions(): void {
    const series = this.series();
    this.actualOptions = {
      series: series ? (Object.assign({ type: 'sunburst' }, series) as any) : [],
      tooltip: { show: this.toolTip() }
    };

    this.applyTitles();
  }
}
