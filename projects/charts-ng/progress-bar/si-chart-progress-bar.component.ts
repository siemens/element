/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, input } from '@angular/core';
import {
  SiChartBaseComponent,
  echarts,
  BarSeriesOption,
  ChartXAxis,
  ChartYAxis
} from '@siemens/charts-ng/common';
import { SiCustomLegendComponent } from '@siemens/charts-ng/custom-legend';
import { SiChartLoadingSpinnerComponent } from '@siemens/charts-ng/loading-spinner';
import { BarChart } from 'echarts/charts';
import { GridComponent } from 'echarts/components';
import { LegacyGridContainLabel } from 'echarts/features';

import { ProgressBarChartSeries, ProgressBarValueUpdate } from './si-chart-progress-bar.interface';

echarts.use([BarChart, GridComponent, LegacyGridContainLabel]);

@Component({
  selector: 'si-chart-progress-bar',
  imports: [SiCustomLegendComponent, SiChartLoadingSpinnerComponent],
  templateUrl: '../common/si-chart-base.component.html',
  styleUrl: '../common/si-chart-base.component.scss'
})
export class SiChartProgressBarComponent extends SiChartBaseComponent {
  /** The series for the chart. */
  readonly series = input<ProgressBarChartSeries[]>();
  /** Used to display the label in inline or above the progress-bar. */
  readonly labelPosition = input<string>();

  private maxValue = 100;
  private xAxisConfig: ChartXAxis = { type: 'value', max: this.maxValue };
  private yAxis: ChartYAxis = {
    type: 'category',
    data: [],
    axisLabel: {
      show: true,
      fontSize: 14
    }
  };

  private readonly formatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });
  private labelPositionOption: BarSeriesOption['label'];
  private labelPositionOptionForValue: BarSeriesOption['label'];

  private labelFormatter(p: any): string {
    return this.formatter.format(this.maxValue - p.value) + ' %';
  }

  protected override themeChanged(): void {
    this.applyOptions();
  }

  protected override applyOptions(): void {
    this.showLegend.set(false);
    const grey = this.getThemeCustomValue(['progress', 'grey'], '#E6E6E6');
    const labelColor = this.getThemeCustomValue(['progressBar', 'labelColor'], '#000');
    const itemWidth = this.getThemeCustomValue(['progressBar', 'itemWidth'], 20);

    if (this.labelPosition() === 'top') {
      this.yAxis.axisLabel = false;
      this.labelPositionOption = {
        position: [0, -16],
        formatter: '{b}',
        fontSize: 14,
        color: labelColor,
        show: true
      };
      this.labelPositionOptionForValue = {
        position: ['100%', '-80%'],
        align: 'right',
        show: true,
        formatter: p => this.labelFormatter(p),
        color: labelColor,
        fontWeight: 700
      };
    } else {
      this.yAxis.axisLabel.show = true;
      this.labelPositionOption = {
        show: false
      };
      this.labelPositionOptionForValue = {
        position: 'right',
        show: true,
        formatter: p => this.labelFormatter(p),
        color: labelColor,
        fontWeight: 700
      };
    }

    this.actualOptions = {
      series: [],
      xAxis: this.xAxisConfig,
      yAxis: this.yAxis,
      grid: {},
      tooltip: {}
    };
    const categoryAxisOpts = {
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: this.yAxis.axisLabel },
      inverse: true
    };

    const valueAxisOpts = {
      axisLabel: { show: false },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { show: false }
    };

    echarts.util.merge(this.actualOptions.yAxis, categoryAxisOpts, true);
    echarts.util.merge(this.actualOptions.xAxis, valueAxisOpts, true);

    this.actualOptions.grid = this.getThemeCustomValue(['progressBar', 'grid'], {});

    const series = this.series();
    if (series) {
      const optionSeries = this.actualOptions.series as BarSeriesOption[];
      (this.actualOptions.yAxis as any).data = series.map(item => item.name);

      const dataItem: BarSeriesOption = {
        type: 'bar',
        stack: 'chart',
        z: 3,
        barWidth: itemWidth,
        label: this.labelPositionOption,
        data: series.map(item => item.percent)
      };

      const fillerItem: BarSeriesOption = {
        type: 'bar',
        stack: 'chart',
        silent: true,
        label: this.labelPositionOptionForValue,
        itemStyle: {
          color: grey
        },
        data: series.map(item => this.maxValue - item.percent)
      };

      optionSeries.push(dataItem);
      optionSeries.push(fillerItem);
    }

    this.applyTitles();
  }

  protected override applyDataZoom(): void {}

  /**
   * Updates single value of a single progress bar.
   */
  changeSingleValue(valueIndex: number, value: number): void {
    const optionSeries = this.actualOptions.series as BarSeriesOption[];
    optionSeries[0].data![valueIndex] = value;
    optionSeries[1].data![valueIndex] = this.maxValue - value;
    this.updateEChart();
  }

  /**
   * Updates multiple values of a single progress bar.
   */
  changeMultiValues(updateValues: ProgressBarValueUpdate[]): void {
    const optionSeries = this.actualOptions.series as BarSeriesOption[];
    updateValues.forEach(update => {
      const currentDataItem = optionSeries[0].data![update.valueIndex];
      if (!currentDataItem) {
        return;
      }
      optionSeries[0].data![update.valueIndex] = update.value;
      optionSeries[1].data![update.valueIndex] = this.maxValue - update.value;
    });

    this.updateEChart();
  }
}
