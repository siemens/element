/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, input } from '@angular/core';
import { PieSeriesOption } from 'echarts';

import { SiChartLoadingSpinnerComponent } from '../si-chart-loading-spinner/si-chart-loading-spinner.component';
import { SiChartComponent } from '../si-chart/si-chart.component';
import { SiCustomLegendComponent } from '../si-custom-legend/si-custom-legend.component';
import { ProgressChartSeries, ProgressValueUpdate } from './si-chart-progress.interface';

@Component({
  selector: 'si-chart-progress',
  imports: [SiCustomLegendComponent, SiChartLoadingSpinnerComponent],
  templateUrl: '../si-chart/si-chart.component.html',
  styleUrl: '../si-chart/si-chart.component.scss'
})
export class SiChartProgressComponent extends SiChartComponent {
  readonly series = input<ProgressChartSeries[]>();

  /**
   * How big the data can get in degrees.
   *
   * @defaultValue 220
   */
  readonly dataAngle = input(220);

  // item width in % radius
  private itemWidth!: number;

  // item gap in % radius
  private itemGap!: number;

  // base radius of an item
  private baseRadius = 98;

  private sizeFactor!: number;

  // placement chart in % on canvas
  private center!: number;

  // color of disabled part of item
  private grey!: string;

  // where the data starts. not very intuitive:
  // 0° is at 3 o'clock, goes counterclockwise, but series drawing goes clockwise
  private startAngle!: number;

  protected override afterChartInit(): void {
    this.chart.on('legendselectchanged', (params: any) => {
      this.updateRadius(params.selected);
      this.updateEChart();
    });
  }

  protected override themeChanged(): void {
    this.applyOptions();
  }

  protected override handleSelectionChanged(event: any): void {
    super.handleSelectionChanged(event);
    this.updateRadius(event.selected);
    this.updateEChart();
  }

  protected override applyOptions(): void {
    this.actualOptions = {
      series: [],
      legend: [
        {
          data: []
        }
      ]
    };

    const dataAngle = this.dataAngle();
    this.startAngle = dataAngle === 360 ? 90 : 270 - (360 - dataAngle) / 2;
    this.itemWidth = this.getThemeCustomValue(['progress', 'itemWidth'], 6);
    this.itemGap = this.getThemeCustomValue(['progress', 'itemGap'], 6);
    this.grey = this.getThemeCustomValue(['progress', 'grey'], '#E6E6E6');

    // a factor to change the size of base radius and center related to
    // dataAngle proportionately
    this.sizeFactor = 1 - Math.sin((((this.dataAngle() - 180) / 2) * Math.PI) / 180);
    this.center = 50 + 25 * this.sizeFactor;

    const seriesValue = this.series();
    if (seriesValue) {
      seriesValue.forEach(series => {
        this.addSeries(series.name, series.percent);
        if (this.showLegend()) {
          this.addLegendItem(series.name);
        }
      });
    }

    this.applyTitles();
  }

  private labelFormatter(p: any): string {
    return p.seriesName + '\n' + Math.round((100 / this.dataAngle()) * p.value) + ' %';
  }

  private addSeries(name: string, percent: number): void {
    const optionSeries = this.actualOptions.series as PieSeriesOption[];
    const index = optionSeries.length;

    const offset =
      !this.showCustomLegend() && this.subTitle()
        ? this.getThemeCustomValue(['subTitle', 'legend', 'top'], 0)
        : 0;
    const top = !this.sizeFactor ? 32 + offset : Math.floor(offset / 2);
    const bottom = !this.sizeFactor ? undefined : -offset;

    const item: PieSeriesOption = {
      top,
      bottom,
      center: ['50%', this.center + '%'],
      name,
      type: 'pie',
      colorBy: 'series',
      radius: this.calculateRadius(index),
      avoidLabelOverlap: false,
      tooltip: { show: false },
      startAngle: this.startAngle,
      label: {
        show: false,
        formatter: p => this.labelFormatter(p),
        position: 'center'
      },
      labelLine: {
        show: false
      },
      emphasis: {
        label: {
          show: true,
          lineHeight: 30,
          fontSize: '30',
          fontWeight: 'bold'
        }
      },
      itemStyle: {
        borderWidth: 0
      },
      data: [
        {
          value: 0,
          name: 'v' + index,
          label: {
            lineHeight: 30,
            fontSize: 30,
            color: 'inherit'
          }
        },
        {
          value: 0,
          name: 'a' + index,
          itemStyle: { color: this.grey },
          emphasis: {
            scale: false,
            itemStyle: { color: this.grey }
          },
          cursor: 'default',
          label: { show: false }
        },
        {
          value: 0,
          name: 'b' + index,
          itemStyle: { color: 'rgba(0,0,0,0)' },
          cursor: 'default',
          label: { show: false }
        }
      ]
    };

    this.updateData(item, percent);
    optionSeries.push(item);
  }

  private updateData(series: any, percent: number): void {
    const angle = (this.dataAngle() * percent) / 100;
    series.data[0].value = angle;
    series.data[1].value = this.dataAngle() - angle;
    series.data[2].value = 360 - this.dataAngle();
    series.realValue = percent;
  }

  private calculateRadius(index: number): string[] {
    const outerRadius = this.baseRadius - index * (this.itemWidth + this.itemGap);
    const innerRadius = outerRadius - this.itemWidth;
    return [innerRadius + '%', outerRadius + '%'];
  }

  private updateRadius(selected: any): void {
    let visibleIndex = 0;
    const optionSeries = this.actualOptions.series as PieSeriesOption[];
    optionSeries.forEach(series => {
      if (selected[series.name!] === false) {
        return;
      }
      series.radius = this.calculateRadius(visibleIndex);
      visibleIndex++;
    });
  }

  protected override applyDataZoom(): void {}

  /**
   * Update single value of the progress chart.
   */
  changeSingleValue(index: number, percent: number): void {
    const optionSeries = this.actualOptions.series as PieSeriesOption[];
    this.updateData(optionSeries[index], percent);
    this.updateEChart();
  }

  /**
   * Update multiple values of the progress chart.
   */
  changeMultiValues(updateValues: ProgressValueUpdate[]): void {
    const optionSeries = this.actualOptions.series as PieSeriesOption[];
    updateValues.forEach(update => {
      const currentSeries = optionSeries[update.seriesIndex];
      if (!currentSeries) {
        return;
      }
      this.updateData(currentSeries, update.percent);
    });

    this.updateEChart();
  }
}
