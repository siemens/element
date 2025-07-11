/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { Component, input } from '@angular/core';

import { PieSeriesOption } from '../../shared/echarts.model';
import { SiChartLoadingSpinnerComponent } from '../si-chart-loading-spinner/si-chart-loading-spinner.component';
import { SiChartComponent } from '../si-chart/si-chart.component';
import { SiCustomLegendComponent } from '../si-custom-legend/si-custom-legend.component';
import { CircleChartSeries, CircleValueUpdate } from './si-chart-circle.interface';

@Component({
  selector: 'si-chart-circle',
  imports: [SiCustomLegendComponent, SiChartLoadingSpinnerComponent],
  templateUrl: '../si-chart/si-chart.component.html',
  styleUrl: '../si-chart/si-chart.component.scss'
})
export class SiChartCircleComponent extends SiChartComponent {
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
      const s: any = Object.assign({ type: 'pie', top }, series);
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
    (series[valueIndex] as any).value = value;
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
      (currentSeries[update.valueIndex] as any).value = update.value;
    });

    this.updateEChart();
  }
}
