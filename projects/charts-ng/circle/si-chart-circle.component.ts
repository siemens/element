/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, input } from '@angular/core';
import { SiChartBaseComponent, PieSeriesOption, echarts } from '@siemens/charts-ng/common';
import { SiCustomLegendComponent } from '@siemens/charts-ng/custom-legend';
import { SiChartLoadingSpinnerComponent } from '@siemens/charts-ng/loading-spinner';
import { PieChart } from 'echarts/charts';
import { LegendComponent } from 'echarts/components';

import { CircleChartData, CircleChartSeries, CircleValueUpdate } from './si-chart-circle.interface';

echarts.use([PieChart, LegendComponent]);

@Component({
  selector: 'si-chart-circle',
  imports: [SiCustomLegendComponent, SiChartLoadingSpinnerComponent],
  templateUrl: '../common/si-chart-base.component.html',
  styleUrl: '../common/si-chart-base.component.scss'
})
export class SiChartCircleComponent extends SiChartBaseComponent {
  /** The series for the chart. */
  readonly series = input<CircleChartSeries[]>();

  protected override applyOptions(): void {
    this.actualOptions = {
      series: [],
      legend: [
        {
          data: []
        }
      ],
      tooltip: {
        trigger: 'item',
        confine: true
      }
    };
    const optionSeries = this.actualOptions.series as PieSeriesOption[];

    const offset =
      !this.showCustomLegend() && this.subTitle()
        ? this.getThemeCustomValue(['subTitle', 'legend', 'top'], 0)
        : 0;
    const top = 32 + offset;
    this.series()?.forEach(series => {
      const s: PieSeriesOption = { type: 'pie', top, ...series };
      optionSeries.push(s);
      if (this.showLegend()) {
        series.data.forEach(data => {
          if (data.name) {
            this.addLegendItem(data.name);
          }
        });
      }
    });

    this.applyTitles();
  }

  protected override applyDataZoom(): void {}

  /**
   * Update single value of the circle chart.
   */
  changeSingleValue(index: number, valueIndex: number, value: number): void {
    const optionSeries = this.actualOptions.series as PieSeriesOption[];
    const series = optionSeries[index].data!;
    (series[valueIndex] as CircleChartData).value = value;
    this.updateEChart();
  }

  /**
   * Update multiple values of the circle chart.
   */
  changeMultiValues(updateValues: CircleValueUpdate[]): void {
    const optionSeries = this.actualOptions.series as PieSeriesOption[];
    updateValues.forEach(update => {
      const currentSeries = optionSeries[update.seriesIndex].data!;
      if (!currentSeries) {
        return;
      }
      (currentSeries[update.valueIndex] as CircleChartData).value = update.value;
    });

    this.updateEChart();
  }
}
