/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, input, OnChanges, SimpleChanges } from '@angular/core';

import { echarts } from '../../shared/echarts.custom';
import { LegendComponentOption, TooltipComponentOption } from '../../shared/echarts.model';
import { SiChartLoadingSpinnerComponent } from '../si-chart-loading-spinner/si-chart-loading-spinner.component';
import { SiChartComponent } from '../si-chart/si-chart.component';
import {
  ChartXAxis,
  ChartYAxis,
  DataZoomRange,
  SeriesUpdate
} from '../si-chart/si-chart.interfaces';
import { SiCustomLegendComponent } from '../si-custom-legend/si-custom-legend.component';
import { CustomLegend, CustomLegendProps } from '../si-custom-legend/si-custom-legend.interface';
import {
  CartesianChartData,
  CartesianChartSeries,
  SubchartGrid
} from './si-chart-cartesian.interfaces';

@Component({
  selector: 'si-chart-cartesian',
  imports: [SiCustomLegendComponent, SiChartLoadingSpinnerComponent],
  templateUrl: '../si-chart/si-chart.component.html',
  styleUrl: '../si-chart/si-chart.component.scss'
})
export class SiChartCartesianComponent extends SiChartComponent implements OnChanges {
  readonly series = input<CartesianChartSeries[]>();
  readonly subChartGrids = input<SubchartGrid[]>();
  readonly yAxis = input<ChartYAxis | ChartYAxis[]>();
  readonly xAxis = input<ChartXAxis | ChartXAxis[]>();
  readonly tooltipFormatter = input<TooltipComponentOption['formatter']>();
  /**
   * Used to display the chart as a stacked one.
   *
   * @defaultValue false
   */
  readonly stacked = input(false);
  /** Enable or disable brush zoom mode */
  readonly zoomMode = input<boolean>();

  // Used to toggle different chart types
  override ngOnChanges(changes: SimpleChanges): void {
    if (changes.zoomMode) {
      this.setZoomMode();
    }
    if (changes.stacked) {
      changes.forceAll = changes.stacked;
    }
    if (changes.subChartGrids) {
      changes.forceAll = changes.subChartGrids;
    }
    super.ngOnChanges(changes);
  }

  private formatTooltip(p: object | object[]): string {
    const params = Array.isArray(p) ? p : [p];
    const label: string = params[0]?.axisValueLabel ?? '';

    let html = label;
    for (const series of params) {
      const isCandle = series.componentSubType === 'candlestick';
      const isPie = series.componentSubType === 'pie';
      const useName = series.name != series.axisValue;
      const name = isPie
        ? series.data.name
        : useName
          ? // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            series.name || series.seriesName
          : series.seriesName;
      const valIndex = (series.encode.value ?? series.encode.y)[0];
      const value = isCandle
        ? ''
        : isPie
          ? series.percent + '%'
          : Array.isArray(series.value)
            ? series.value[valIndex]
            : series.value;

      html += '<div style="display: flex; align-items: center;">';
      html += this.getSeriesMarkerSvg(name);
      html += `<span style="margin-inline: 4px 8px">${name}</span>`;
      html += `<span style="margin-inline-start: auto">${value}</span>`;
      html += '</div>';
    }
    return html;
  }

  /**
   * Get the series marker svg by series name.
   */
  getSeriesMarkerSvg(seriesName: string): string {
    const seriesValue = this.actualOptions.series as CartesianChartSeries[];
    let sym;
    if (seriesValue) {
      sym = this.getSeriesMarker(seriesName);
      const symbol = this.shapePaths[sym as string];
      const color = this.getSeriesColorBySeriesName(seriesName);
      return `<svg width="12" height="12" xmlns="http://www.w3.org/2000/svg">
                  <path  d="${symbol}" fill="${color}"  />
            </svg>`;
    }
    return '';
  }

  /**
   * Get the series marker by series name.
   */
  getSeriesMarker(seriesName: string): string {
    const seriesValue = this.actualOptions.series as CartesianChartSeries[];
    if (seriesValue) {
      const seriesMarker = seriesValue.find(ser => ser.name === seriesName);
      if (seriesMarker && 'symbol' in seriesMarker) {
        return seriesMarker.symbol as string;
      }
    }
    return 'circle';
  }

  protected override afterChartInit(skipZoom?: boolean): void {
    super.afterChartInit(skipZoom);
    if (this.zoomMode()) {
      this.setZoomMode();
    }
  }

  protected override setZoomMode(): void {
    this.dispatchEChartAction({
      type: 'takeGlobalCursor',
      key: 'dataZoomSelect',
      dataZoomSelectActive: this.zoomMode()
    });
  }

  protected override getValidXAxis(): Set<number> {
    const validXAxis: Set<number> = new Set<number>();
    this.series()?.forEach(series => {
      if (series.visible !== false && series.xAxisIndex !== undefined) {
        validXAxis.add(series.xAxisIndex);
      }
    });
    return validXAxis;
  }

  protected override applyOptions(): void {
    this.actualOptions = {
      series: [],
      xAxis: this.xAxis(),
      grid: this.getGrid(),
      yAxis: this.yAxis(),
      toolbox: {
        showTitle: false,
        itemSize: 0,
        feature: {
          dataZoom: {
            filterMode: 'none',
            xAxisIndex: 'all',
            yAxisIndex: false,
            icon: {
              zoom: 'image://',
              back: 'image://'
            }
          }
        }
      },
      legend: [
        {
          data: []
        },
        {
          data: []
        }
      ],
      tooltip: {
        trigger: 'axis'
      }
    };
    const tooltipFormatter = this.tooltipFormatter();
    if (tooltipFormatter) {
      this.actualOptions.tooltip.formatter = tooltipFormatter;
    } else if (this.hasDifferentMarker()) {
      this.actualOptions.tooltip.formatter = this.formatTooltip.bind(this);
    }

    const yAxis = this.yAxis();
    const yAxisArray = Array.isArray(yAxis) ? yAxis : yAxis ? [yAxis] : [];
    const numRight = yAxisArray.reduce((acc, cur) => acc + (cur.position === 'right' ? 1 : 0), 0);
    const numLeft = yAxisArray.length - numRight;
    const legendLeftOptions = this.getThemeCustomValue(['legendLeft'], {});
    const legendRightOptions = this.getThemeCustomValue(['legendRight'], {});
    let leftUnitText: string | undefined;
    let rightUnitText: string | undefined;
    const legends = this.actualOptions.legend as LegendComponentOption[];
    if (numLeft && numRight) {
      echarts.util.merge(legends[0], legendLeftOptions, true);
      echarts.util.merge(legends[1], legendRightOptions, true);
    } else if (Array.isArray(this.yAxis()) && numLeft) {
      echarts.util.merge(legends[0], { left: legendLeftOptions.left }, true);
    } else if (numRight) {
      echarts.util.merge(legends[1], { right: legendRightOptions.right }, true);
    }

    const subChartGrids = this.subChartGrids();
    if (subChartGrids) {
      if (subChartGrids.length !== this.customLegend.length) {
        const diff = subChartGrids.length - this.customLegend.length;
        if (diff < 0) {
          this.customLegend.length = subChartGrids.length;
        } else {
          for (let i = 0; i < diff; i++) {
            // Add default custom legends for all grids
            const cl: CustomLegend = {
              customLegends: [
                { list: [], unit: '' },
                { list: [], unit: '' }
              ],
              legendAxis: 'both'
            };
            this.customLegend.push(cl);
          }
        }
      }
      const margin = 16;
      // calculate custom legend positions from top according to subcharts.
      for (let i = 0; i < subChartGrids.length; i++) {
        if (i === 0) {
          this.customLegend[i].top = 0;
        } else {
          const prevGrid = subChartGrids[i - 1];
          const subChartTop = (prevGrid.top as number) ?? 0;
          const subChartHeight = (prevGrid.height as number) ?? 0;
          this.customLegend[i].top = subChartTop + subChartHeight + margin;
        }
      }
    }

    const seriesValue = this.series();
    if (seriesValue) {
      const optionSeries = this.actualOptions.series as CartesianChartSeries[];
      seriesValue.forEach(series => {
        const s: any = Object.assign(
          {
            stack: this.stacked()
          },
          series
        );
        if (s.type === 'line' && s.area) {
          delete s.area;
          s.areaStyle = {};
        } else {
          s.areaStyle ??= null;
        }
        delete s.visible;

        if ('symbol' in series && !this.shapePaths[series.symbol as string]) {
          s.symbol = 'circle';
        }

        optionSeries.push(s);

        if (this.showLegend() && series.name) {
          let legendIndex = 0;
          const axis = yAxisArray[series.yAxisIndex ?? 0];
          if (axis && axis.position === 'right') {
            legendIndex = 1;
          }

          let customLegendProp: CustomLegendProps | undefined;
          if (this.showCustomLegend()) {
            // get left and right axis units from axis array
            if (axis && (axis.show === undefined || axis.show)) {
              if ((!leftUnitText || leftUnitText !== axis.name) && axis.position === 'left') {
                if (axis.name != null) {
                  // axis.name is the same property name which eChart uses to display axis title,
                  // hence in case of custom legends units were shown at two places i.e. at axis
                  // title as well as custom legend unit section. Thus changing the property name
                  // to customLegendUnit only in case custom legends are used.
                  axis.customLegendUnit = axis.name;
                }
                if (axis.customLegendUnit != null) {
                  leftUnitText = axis.customLegendUnit;
                }
              } else if (
                (!rightUnitText || rightUnitText !== axis.name) &&
                axis.position === 'right'
              ) {
                if (axis.name != null) {
                  // axis.name is the same property name which eChart uses to display axis title,
                  // hence in case of custom legends units were shown at two places i.e. at axis
                  // title as well as custom legend unit section. Thus changing the property name
                  // to customLegendUnit only in case custom legends are used.
                  axis.customLegendUnit = axis.name;
                }
                if (axis.customLegendUnit != null) {
                  rightUnitText = axis.customLegendUnit;
                }
              }
              delete axis.name;
            }

            const unitText = axis.position === 'right' ? rightUnitText : leftUnitText;
            customLegendProp = {
              displayName: s.displayName,
              tooltip: s.customLegendToolTip,
              unit: unitText
            };
          }
          // As we have only 1 xAxis per sub chart, xAxisIndex equals grid index.
          const seriesSymbol = 'symbol' in s ? (s.symbol as string) : 'circle';
          this.addLegendItem(
            series.name as string,
            series.visible,
            legendIndex,
            series.xAxisIndex,
            customLegendProp,
            seriesSymbol
          );
        }
      });
    }

    this.applyTitles();
    if (this.externalZoomSlider()) {
      this.extZoomSliderOptions.legend = this.actualOptions.legend;
    }
  }

  private hasDifferentMarker(): boolean {
    const seriesValue = this.series();
    return !!seriesValue?.some(series => 'symbol' in series && series.symbol !== 'circle');
  }

  private getGrid(): any {
    const subChartGrids = this.subChartGrids();
    if (subChartGrids) {
      subChartGrids.forEach(g => (g.containLabel = false));
      return subChartGrids;
    }
    return {};
  }

  override refreshSeries(isLive: boolean = true, dzToSet?: DataZoomRange): void {
    const seriesValue = this.series();
    if (!seriesValue) {
      return;
    }
    const optionSeries = this.actualOptions.series as CartesianChartSeries[];
    seriesValue.forEach((series, i) => {
      optionSeries[i].data = series.data;
    });
    super.refreshSeries(isLive, dzToSet);
  }

  protected override hasData(): boolean {
    return this.series()?.some(s => s.visible !== false && s.data && s.data.length > 0) ?? false;
  }

  protected override handleSelectionChanged(event: any): void {
    if (event?.selected) {
      this.series()?.forEach(series => (series.visible = event.selected[series.name!] !== false));
    }
    super.handleSelectionChanged(event);
  }

  /**
   * Update single chart data entry.
   */
  addData(index: number, data: CartesianChartData): void {
    this.addDataInternal([{ index, data }]);
  }

  /**
   * Append charts data entries to the end of the series.
   */
  addDataMulti(series: SeriesUpdate<CartesianChartData>[]): void {
    this.addDataInternal(series);
  }
}
