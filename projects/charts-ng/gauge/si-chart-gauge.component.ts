/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  LOCALE_ID,
  OnChanges,
  SimpleChange,
  SimpleChanges
} from '@angular/core';
import { SiChartBaseComponent, GaugeSeriesOption, echarts } from '@siemens/charts-ng/common';
import { SiCustomLegendComponent } from '@siemens/charts-ng/custom-legend';
import { SiChartLoadingSpinnerComponent } from '@siemens/charts-ng/loading-spinner';
import { GaugeChart } from 'echarts/charts';

import { GaugeChartSeries } from './si-chart-gauge.interface';

echarts.use([GaugeChart]);

@Component({
  selector: 'si-chart-gauge',
  imports: [SiCustomLegendComponent, SiChartLoadingSpinnerComponent],
  templateUrl: '../common/si-chart-base.component.html',
  styleUrl: '../common/si-chart-base.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class SiChartGaugeComponent extends SiChartBaseComponent implements OnChanges {
  /** The lowest value displayed on the gauge axis.
   *
   * @defaultValue 0
   */
  readonly minValue = input(0);
  /** The highest value displayed on the gauge axis.
   *
   * @defaultValue 100
   */
  readonly maxValue = input(100);
  /** The value displayed by the gauge.
   *
   * @defaultValue 0
   */
  readonly value = input(0);
  /** The value at which the main value arc starts.
   * Values outside the gauge range are clamped to `minValue` or `maxValue`.
   * When not set, the value arc starts at `minValue`.
   */
  readonly valueArcStart = input<number>();
  /** The number of intervals displayed on the gauge axis. */
  readonly splitSteps = input<number>();
  /** Whether the number of gauge-axis intervals adapts to the component size.
   *
   * @defaultValue true
   */
  readonly responsiveSplitSteps = input(true);
  /** The unit displayed with the gauge value.
   *
   * @defaultValue '%'
   */
  readonly unit = input('%');
  /** Whether to display the unit on gauge-axis labels.
   *
   * @defaultValue false
   */
  readonly unitsOnSplit = input(false);
  /**
   * Custom formatter for axis labels.
   * Takes precedence when specified, i.e. number of decimals, unit etc needs
   * to be set by the user using this formatter.
   */
  readonly labelFormatter = input<(val: number) => string>();
  /**
   * Custom formatter for value.
   * Takes precedence when specified, i.e. number of decimals needs
   * to be set by the user using this formatter.
   */
  readonly valueFormatter = input<(val: number) => string>();
  /**
   * Min number of decimals.
   * Possible values are from 0 to 100.
   * @defaultValue 0
   */
  readonly minNumberOfDecimals = input(0);
  /**
   * Max number of decimals.
   * Possible values are from 0 to 100.
   * @defaultValue 0
   */
  readonly maxNumberOfDecimals = input(0);
  /**
   * Number of decimals on the axis.
   * Possible values are from 0 to 100.
   * @defaultValue 0
   */
  readonly axisNumberOfDecimals = input(0);
  /** Whether to hide the gauge-axis labels.
   *
   * @defaultValue false
   */
  readonly hideAxisLabels = input(false, { transform: booleanAttribute });
  /**
   * Segments on the arc from 0 (implicit) to 1 (explicit)
   * E.g. 0.2 means from 0 to 0.2 of the possible range (maxValue - minValue)
   *
   * @defaultValue [0.2, 0.8, 1]
   */
  readonly segments = input<number[]>([0.2, 0.8, 1]);
  /**
   * Colors for the defined segments.
   * If there are less colors then segments, the colors will be repeated. Defaults to the standard color palette
   */
  readonly colors = input<string[]>();

  private readonly locale = inject(LOCALE_ID).toString();
  private readonly numberFormat = computed(() => {
    const minDecimals = this.minNumberOfDecimals();
    return new Intl.NumberFormat(this.locale, {
      minimumFractionDigits: minDecimals,
      maximumFractionDigits: Math.max(minDecimals, this.maxNumberOfDecimals())
    });
  });

  private readonly axisNumberFormat = computed(() => {
    const decimals = this.axisNumberOfDecimals();
    return new Intl.NumberFormat(this.locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  });

  protected override afterChartInit(): void {
    super.afterChartInit();
    this.applyOptions();
    this.updateColors();
    this.refreshSeries();
  }

  private updateColors(): void {
    // gauge doesn't respect color palette, it needs a bit convincing
    const effectiveOpts: any = this.getOptionNoClone();
    const colors: string[] = this.colors() ?? effectiveOpts.color;
    const hasIndicator = !!this.segments().length;

    let newColors: [number, string][];
    if (hasIndicator) {
      newColors = this.segments().map((threshold, index) => {
        const color = colors[index % colors.length];
        return [threshold, color];
      });
    } else {
      const colorsValue = this.colors();
      const dataColor = colorsValue?.length
        ? colorsValue[0]
        : this.getThemeCustomValue(['gauge', 'defaultColor'], colors[0]);
      newColors = [[1, dataColor]];
    }

    if (hasIndicator) {
      this.setAxisLineColor(newColors, (this.actualOptions.series![0] as any).axisLine);
    }
    (this.actualOptions.series![0] as any).axisLine.show = hasIndicator;

    this.setAxisLineColor(
      this.getValueArcColors(newColors),
      (this.actualOptions.series![2] as any).axisLine
    );
    this.refreshSeries();
  }

  private setAxisLineColor(colors: [number, string][], axisLine: any): void {
    axisLine.lineStyle = axisLine.lineStyle ?? {};
    axisLine.lineStyle.color = colors;
  }

  private getValueArcColors(colors: [number, string][]): [number, string][] {
    const minValue = this.minValue();
    const maxValue = this.maxValue();
    const valueArcStart = this.valueArcStart();
    if (
      valueArcStart === undefined ||
      valueArcStart <= minValue ||
      valueArcStart >= maxValue ||
      maxValue <= minValue
    ) {
      return colors;
    }

    const startRatio = (valueArcStart - minValue) / (maxValue - minValue);
    return colors
      .filter(([threshold]) => threshold > startRatio)
      .map(([threshold, color]) => [(threshold - startRatio) / (1 - startRatio), color]);
  }

  private getValueArcOptions(): { min: number; startAngle: number; showProgress: boolean } {
    const minValue = this.minValue();
    const maxValue = this.maxValue();
    const valueArcStart = this.valueArcStart();
    if (valueArcStart === undefined || valueArcStart <= minValue || maxValue <= minValue) {
      return { min: minValue, startAngle: 180, showProgress: true };
    } 
    if (valueArcStart >= maxValue) {
      return { min: minValue, startAngle: 180, showProgress: false };
    }

    const startRatio = (valueArcStart - minValue) / (maxValue - minValue);
    return {
      min: valueArcStart,
      startAngle: 180 * (1 - startRatio),
      showProgress: true
    };
  }

  private getResponsiveConfig(): {
    outerRadius: number;
    center: (string | number)[];
    progressWidth: number;
    indicatorWidth: number;
    gap: number;
    splits: number;
    axisLabelDist: number;
    axisFontSize: number;
    valueFontSize: number;
    unitFontSize: number;
  } {
    const marginY = 12;
    const maxHeight = this.curHeight - marginY;
    const dim = Math.min(this.curWidth / 2, maxHeight);
    const top = dim < maxHeight ? this.curHeight / 2 + dim / 2 : maxHeight;

    if (dim < 150) {
      const splits = dim < 100 ? 1 : 4;
      const axisLabelDist = dim < 100 ? -6 : 0;
      return {
        outerRadius: dim - 4,
        center: ['50%', top],
        progressWidth: 8,
        indicatorWidth: 1,
        gap: 2,
        splits,
        axisLabelDist,
        axisFontSize: 12,
        valueFontSize: 18,
        unitFontSize: 12
      };
    }

    if (dim < 200) {
      return {
        outerRadius: dim - 7,
        center: ['50%', top],
        progressWidth: 14,
        indicatorWidth: 3,
        gap: 3,
        splits: 6,
        axisLabelDist: 12,
        axisFontSize: 16,
        valueFontSize: 30,
        unitFontSize: 14
      };
    }

    return {
      outerRadius: dim - 12,
      center: ['50%', top],
      progressWidth: 24,
      indicatorWidth: 4,
      gap: 5,
      splits: 0,
      axisLabelDist: 20,
      axisFontSize: 20,
      valueFontSize: 40,
      unitFontSize: 14
    };
  }

  private readonly axisLabelFormatter = (value: any): string => {
    const formatted = this.axisNumberFormat().format(Number(value));
    return this.unitsOnSplit() ? `${formatted} ${this.unit()}` : formatted;
  };

  protected override applyOptions(): void {
    const resp = this.getResponsiveConfig();
    const hasIndicator = !!this.segments().length;
    const valueArcOptions = this.getValueArcOptions();

    const splitNumber =
      this.responsiveSplitSteps() && resp.splits ? resp.splits : this.splitSteps();
    const grey = this.getThemeCustomValue(['gauge', 'grey'], '#F0F2F5');
    const axisColor = this.getThemeCustomValue(['gauge', 'unit'], '#656A6F');

    const indicator: GaugeSeriesOption = {
      type: 'gauge',
      radius: resp.outerRadius - resp.progressWidth - resp.gap,
      startAngle: 180,
      endAngle: 0,
      min: this.minValue(),
      max: this.maxValue(),
      center: resp.center,
      axisLine: {
        show: hasIndicator,
        lineStyle: { width: resp.indicatorWidth }
      },
      axisTick: {
        length: 0,
        splitNumber: 1,
        lineStyle: {
          width: 2,
          color: axisColor
        }
      },
      splitLine: {
        length: 0,
        lineStyle: {
          width: 1,
          color: axisColor
        }
      },
      axisLabel: { show: false }
    };

    const labelDistance = resp.axisLabelDist + (hasIndicator ? resp.indicatorWidth + resp.gap : 0);

    const shade: GaugeSeriesOption = {
      type: 'gauge',
      radius: resp.outerRadius,
      startAngle: 180,
      endAngle: 0,
      min: this.minValue(),
      max: this.maxValue(),
      splitNumber,
      axisTick: { show: false },
      splitLine: { show: false },
      title: { show: false },
      center: resp.center,
      axisLine: {
        lineStyle: {
          width: resp.progressWidth,
          opacity: 0.6,
          color: [[1, grey]]
        }
      },
      axisLabel: {
        show: !this.hideAxisLabels(),
        distance: labelDistance,
        color: axisColor,
        fontSize: resp.axisFontSize,
        formatter: this.labelFormatter() ?? this.axisLabelFormatter
      }
    };

    const data: GaugeSeriesOption = {
      type: 'gauge',
      silent: false,
      radius: resp.outerRadius,
      startAngle: valueArcOptions.startAngle,
      endAngle: 0,
      min: valueArcOptions.min,
      max: this.maxValue(),
      splitNumber,
      progress: {
        show: valueArcOptions.showProgress,
        itemStyle: { color: 'auto' },
        width: resp.progressWidth
      },
      emphasis: {
        // This code is added to avoid flickering when the progress is hovered and
        // when mouse effects are enabled with `silent: false` flag. The issue occurs
        // because of the progress.itemStyle.color is set to `auto` which tries to
        // calculate the color dynamically and it conflicts with the mouse hover action
        // which tries to apply the hover style
        itemStyle: { color: 'auto' }
      },
      pointer: {
        show: true,
        length: '0%',
        itemStyle: {
          color: 'auto',
          opacity: 0.001
        }
      },
      center: resp.center,
      axisLine: {
        show: false,
        lineStyle: { opacity: 0.6 }
      },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      title: { show: false },
      detail: {
        offsetCenter: [0, -0.5 * resp.valueFontSize],
        valueAnimation: true,
        formatter: this.valueFormatterInternal(),
        rich: {
          value: {
            fontSize: resp.valueFontSize,
            lineHeight: resp.valueFontSize,
            fontWeight: 600
          },
          unit: {
            fontSize: resp.unitFontSize,
            lineHeight: resp.unitFontSize,
            padding: [0, 0, (resp.unitFontSize - resp.valueFontSize) / 2, 0]
          }
        }
      },
      data: [{ value: this.value() }]
    };

    const series: GaugeSeriesOption[] = [indicator, shade, data];

    this.showLegend.set(false);
    this.actualOptions.series = series;

    this.applyTitles();
  }

  private valueFormatterInternal(): (val: number) => string {
    const unit = this.unit();
    const valueFormatter = this.valueFormatter();

    const formattedUnit = unit ? (unit.length > 5 ? `\n{unit|${unit}}` : ` {unit|${unit}}`) : '';

    return (value: number): string => {
      if (valueFormatter) {
        return `{value|${valueFormatter(value)}}${formattedUnit}`;
      }
      return `{value|${this.numberFormat().format(value)}}${formattedUnit}`;
    };
  }

  override ngOnChanges(changes: SimpleChanges<unknown>): void {
    if (this.chart && (changes.palette || changes.colors || changes.segments)) {
      this.updateColors();
    }
    const updateValueArcColors =
      this.chart && (changes.minValue || changes.maxValue || changes.valueArcStart);
    changes.forceAll = new SimpleChange(false, true, false);
    super.ngOnChanges(changes);
    if (updateValueArcColors) {
      this.updateColors();
    }
  }

  protected override applyDataZoom(): void {}

  protected override afterChartResize(): void {
    this.applyOptions();
    this.updateColors();
  }

  /**
   * Update gauge chart value.
   */
  setValue(value: number): void {
    const optionSeries = this.actualOptions.series as GaugeChartSeries[];
    optionSeries[2].data[0].value = value;
    this.refreshSeries();
  }
}
