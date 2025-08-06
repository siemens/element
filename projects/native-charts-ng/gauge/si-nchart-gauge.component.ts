/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  LOCALE_ID,
  numberAttribute,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import {
  Coordinate,
  makeArc,
  makeLine,
  polarToCartesian,
  valueToRelativeAngle
} from '@spike-rabbit/native-charts-ng/utils';

/**
 * One series of the gauge chart.
 */
export interface GaugeSeries {
  /** value */
  value: number;
  /** color token */
  colorToken: string;
  /** name displayed in legend */
  name: string;
  /** Optional description line in legend */
  description?: string;
  /** ID exposed as `data-id` */
  id?: string;
}

/**
 * One segment of the gauge chart. The first segment starts at the `min` value of the gauge
 * chart and ends at `endValue`.
 */
export interface GaugeSegment {
  /** color token for this segment. */
  colorToken: string;
  /** end value for this segment, exclusive except for last segment where it's inclusive */
  endValue: number;
}

interface InternalSeries {
  series: GaugeSeries;
  path: string;
  colorVar: string;
  valueString: string;
  highlight: boolean;
}

interface InternalGaugeSegment {
  segment: GaugeSegment;
  path: string;
  colorVar: string;
}

interface Tick {
  path: string;
  label: string;
  textPos: Coordinate;
}

@Component({
  selector: 'si-nchart-gauge',
  templateUrl: './si-nchart-gauge.component.html',
  styleUrl: './si-nchart-gauge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '"legend-" + legendPosition()'
  }
})
export class SiNChartGaugeComponent implements OnInit, OnChanges {
  /**
   * Start angle in degrees
   *
   * @defaultValue -90
   */
  readonly startAngle = input(-90, { transform: numberAttribute });
  /**
   * End angle in degrees
   *
   * @defaultValue 90
   */
  readonly endAngle = input(90, { transform: numberAttribute });

  /**
   * Min value, can be negative
   *
   * @defaultValue -100
   */
  readonly min = input(-100, { transform: numberAttribute });
  /**
   * Max value, can be negative
   *
   * @defaultValue 100
   */
  readonly max = input(100, { transform: numberAttribute });
  /**
   * Display mode: `sum` to sum up multiple series or `single` for a single value with optional
   * segmented display.
   *
   * @defaultValue 'sum'
   */
  readonly mode = input<'sum' | 'single'>('sum');
  /**
   * Series
   *
   * @defaultValue []
   */
  readonly series = input<GaugeSeries[]>([]);
  /**
   * Colored segments.
   *
   * @defaultValue []
   */
  readonly segments = input<GaugeSegment[]>([]);
  /**
   * Unit
   *
   * @defaultValue ''
   */
  readonly unit = input('');
  /**
   * Min number of decimals.
   * @defaultValue 0
   */
  readonly minNumberOfDecimals = input(0);
  /**
   * Max number of decimals.
   * @defaultValue 2
   */
  readonly maxNumberOfDecimals = input(2);
  /**
   * Number of decimals on the axis.
   * @defaultValue 0
   */
  readonly axisNumberOfDecimals = input(0);
  /**
   * Whether to show ticks
   *
   * @defaultValue true
   */
  readonly showTicks = input(true, { transform: booleanAttribute });
  /**
   * Whether to show the legend
   *
   * @defaultValue true
   */
  readonly showLegend = input(true, { transform: booleanAttribute });
  /**
   * Legend position:
   * - `column`: chart and legend form a column, i.e. the legend is below the chart.
   *    The chart size is driven by the available width.
   * - `row`: chart and legend form a row, i.e. the legend is besides the chart. The
   *    The chart size is driven by the available height.
   *
   * @defaultValue 'row'
   */
  readonly legendPosition = input<'row' | 'column'>('row');
  /**
   * Whether to show range start/end labels on the outside of the ring
   *
   * @defaultValue false
   */
  readonly showRangeLabelsOutside = input(false, { transform: booleanAttribute });

  protected dim = { width: 100, height: 60 };
  protected center: Coordinate = { x: 50, y: 50 };
  protected radius = 40;
  protected additionalHeight = 10;

  protected backgroundPath = '';
  protected internalSeries: InternalSeries[] = [];
  protected ticks: Tick[] = [];
  protected totalSum = 0;
  protected totalSumString = '0';
  protected valignMiddle = false;
  protected internalSegments: InternalGaugeSegment[] = [];

  private locale = inject(LOCALE_ID).toString();
  private numberFormat = new Intl.NumberFormat(this.locale, { maximumFractionDigits: 2 });
  private axisNumberFormat = new Intl.NumberFormat(this.locale, {
    minimumFractionDigits: this.axisNumberOfDecimals(),
    maximumFractionDigits: this.axisNumberOfDecimals()
  });

  ngOnChanges(changes: SimpleChanges): void {
    let calc = false;
    if (changes.minNumberOfDecimals || changes.maxNumberOfDecimals) {
      this.numberFormat = new Intl.NumberFormat(this.locale, {
        minimumFractionDigits: this.minNumberOfDecimals(),
        maximumFractionDigits: Math.max(this.minNumberOfDecimals(), this.maxNumberOfDecimals())
      });
      calc = true;
    }
    if (changes.axisNumberOfDecimals) {
      this.axisNumberFormat = new Intl.NumberFormat(this.locale, {
        minimumFractionDigits: this.axisNumberOfDecimals(),
        maximumFractionDigits: this.axisNumberOfDecimals()
      });
      calc = true;
    }
    if (changes.startAngle || changes.endAngle) {
      this.init();
      calc = true;
    }
    if (
      changes.series ||
      changes.min ||
      changes.max ||
      changes.showTicks ||
      changes.showRangeLabelsOutside ||
      changes.segments
    ) {
      calc = true;
    }
    if (calc) {
      this.calc();
    }
  }

  ngOnInit(): void {
    this.init();
    this.calc();
  }

  protected init(): void {
    this.backgroundPath = makeArc(this.center, this.radius, this.startAngle(), this.endAngle());

    // auto adjust height
    const maxAngle = Math.max(Math.abs(this.startAngle()), Math.abs(this.endAngle()));

    const height = Math.max(50, polarToCartesian(this.center, this.radius, maxAngle).y);
    this.dim.height = height + this.additionalHeight;
    this.valignMiddle = height > 50;
  }

  private calc(): void {
    if (this.mode() === 'sum') {
      this.calcSeriesSum();
    } else {
      this.calcSeriesSingle();
    }
  }

  private reset(): void {
    this.totalSum = 0;
    this.internalSeries = [];
    this.internalSegments = [];
    this.ticks = [];
  }

  private calcSeriesSum(): void {
    this.reset();

    const zeroValueAngle =
      this.startAngle() +
      valueToRelativeAngle(this.startAngle(), this.endAngle(), this.min(), this.max(), -this.min());

    this.addTick(this.startAngle(), this.min(), true);
    if (this.min() !== 0) {
      this.addTick(zeroValueAngle, 0, false);
    }
    this.addTick(this.endAngle(), this.max(), true);

    let nextPosAngle = zeroValueAngle;
    let nextNegAngle = zeroValueAngle;
    for (const series of this.series()) {
      if (series.value >= 0) {
        nextPosAngle = this.addInternalSeries(nextPosAngle, series);
      } else if (series.value < 0) {
        nextNegAngle = this.addInternalSeries(nextNegAngle, series, true);
      }
    }

    this.totalSumString = this.numberFormat.format(this.totalSum);
  }

  private calcSeriesSingle(): void {
    this.reset();

    let angle = this.startAngle();
    let value = this.min();
    for (const segment of this.segments()) {
      const nextAngle =
        valueToRelativeAngle(
          this.startAngle(),
          this.endAngle(),
          this.min(),
          this.max(),
          segment.endValue - value
        ) + angle;

      this.internalSegments.push({
        segment,
        colorVar: `var(--${segment.colorToken})`,
        path: makeArc(this.center, this.radius - 3.5, angle, nextAngle)
      });

      if (segment.endValue !== this.max()) {
        this.addTick(nextAngle, segment.endValue, false);
      }

      angle = nextAngle;
      value = segment.endValue;
    }

    this.addTick(this.startAngle(), this.min(), true);
    this.addTick(this.endAngle(), this.max(), true);

    const series = this.series()[0];
    if (!series) {
      this.totalSumString = '-';
      return;
    }

    const activeSegment = this.segments().find(
      (s, i) => series.value < s.endValue || i == this.segments().length - 1
    );
    this.addInternalSeries(this.startAngle(), series, false, activeSegment?.colorToken);

    this.totalSumString = this.numberFormat.format(this.totalSum);
  }

  private addTick(angle: number, title: number, boundary: boolean): void {
    const segmentOffset = this.mode() === 'single' && this.segments().length ? 1.25 : 0;
    const textRadiusOffset =
      boundary && this.showRangeLabelsOutside()
        ? 0
        : this.showTicks()
          ? 10 + segmentOffset
          : 8 + segmentOffset;
    const textPos = polarToCartesian(this.center, this.radius - textRadiusOffset, angle);

    if (boundary && this.showRangeLabelsOutside()) {
      textPos.y += 6;
    }

    this.ticks.push({
      path: this.showTicks() ? this.makeTickPath(angle) : '',
      label: this.axisNumberFormat.format(title),
      textPos
    });
  }

  private makeTickPath(angle: number): string {
    const startRadius =
      this.mode() === 'single' && this.segments().length ? this.radius - 5.5 : this.radius - 4;
    const start = polarToCartesian(this.center, startRadius, angle);
    const end = polarToCartesian(this.center, this.radius + 2, angle);
    return makeLine(start, end);
  }

  private addInternalSeries(
    startAngle: number,
    series: GaugeSeries,
    reverse = false,
    color?: string
  ): number {
    let nextAngle =
      valueToRelativeAngle(
        this.startAngle(),
        this.endAngle(),
        this.min(),
        this.max(),
        series.value
      ) + startAngle;
    const returnNextAngle = nextAngle;

    if (reverse) {
      [startAngle, nextAngle] = [nextAngle, startAngle];
    }

    startAngle = this.containAngle(startAngle);
    nextAngle = this.containAngle(nextAngle);

    if (startAngle !== nextAngle) {
      this.pushInternalSeries(
        series,
        makeArc(this.center, this.radius, startAngle, nextAngle),
        color
      );
    } else {
      this.pushInternalSeries(series, '', color);
    }

    this.totalSum += series.value;

    return returnNextAngle;
  }

  private pushInternalSeries(series: GaugeSeries, path: string, color?: string): void {
    color ??= series.colorToken;
    this.internalSeries.push({
      series,
      path,
      colorVar: `var(--${color})`,
      valueString: this.numberFormat.format(series.value),
      highlight: false
    });
  }

  private containAngle(angle: number): number {
    return Math.max(this.startAngle(), Math.min(this.endAngle(), angle));
  }
}
