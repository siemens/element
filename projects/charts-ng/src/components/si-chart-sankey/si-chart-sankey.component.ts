/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, input } from '@angular/core';

import { SankeySeriesOption } from '../../shared/echarts.model';
import { SiChartLoadingSpinnerComponent } from '../si-chart-loading-spinner/si-chart-loading-spinner.component';
import { SiChartComponent } from '../si-chart/si-chart.component';
import { SiCustomLegendComponent } from '../si-custom-legend/si-custom-legend.component';

@Component({
  selector: 'si-chart-sankey',
  templateUrl: '../si-chart/si-chart.component.html',
  styleUrl: '../si-chart/si-chart.component.scss',
  imports: [SiCustomLegendComponent, SiChartLoadingSpinnerComponent]
})
export class SiChartSankeyComponent extends SiChartComponent {
  readonly series = input<SankeySeriesOption>();
  /** @defaultValue false */
  readonly toolTip = input(false);

  protected override applyOptions(): void {
    const series = this.series();
    this.actualOptions = {
      series: series ? (Object.assign({ type: 'sankey' }, series) as any) : [],
      tooltip: { show: this.toolTip() }
    };

    this.applyTitles();
  }
}
