/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute
} from '@angular/core';
import { Coordinate, makeArc, valueToRelativeAngle } from '@siemens/native-charts-ng/utils';

/**
 * One series of the micro donut chart.
 */
export interface MicroDonutSeries {
  /** value in percent */
  valuePercent: number;
  /** color token */
  colorToken: string;
  /** ID exposed as `data-id` */
  id?: string;
}

interface InternalSeries {
  series: MicroDonutSeries;
  path: string;
  colorVar: string;
}

@Component({
  selector: 'si-micro-donut',
  templateUrl: './si-micro-donut.component.html',
  styleUrl: './si-micro-donut.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiMicroDonutComponent {
  /**
   * Micro donut series. Can also be an array representing multiple series.
   * Each series, in case of multiple, forms section of the arc, in percentage
   * of the respective value.
   * Example series can be:
   * @example
   * ```ts
   * Series: MicroDonutSeries[] = [{ valuePercent: 40, colorToken: 'element-data-4' }];
   * ```
   * @defaultValue []
   */
  readonly series = input.required<MicroDonutSeries[]>();
  /**
   * Radius of donut. The radius is calculated from center of the donut to the mid point of the arc.
   * @defaultValue 7.5
   */
  readonly radius = input(7.5, { transform: numberAttribute });

  protected readonly arcThickness = computed(() => 0.7 * this.radius());
  protected readonly dim = computed(() => {
    // Keeping the viewbox width and height only enough to fit the donut.
    // The radius is calculated from center of the donut to the mid point of the arc.
    // Hence half the arc thicknes on both side needs to be added (equals full arc thickness)
    // The buffer space is added because the svg donut gets cropped on certain Os + browser configuration.
    const radius = this.radius();
    const arcThickness = this.arcThickness();
    const size = 2 * radius + arcThickness + this.bufferSpace;
    return { width: size, height: size };
  });

  protected readonly backgroundPath = computed(() =>
    makeArc(this.center(), this.radius(), this.startAngle, this.endAngle)
  );

  private readonly center = computed<Coordinate>(() => {
    // Once we have the viewbox dimensions, getting the donut at the center by
    // calculating correct coordinates
    const d = this.dim();
    return {
      x: d.width / 2,
      y: d.height / 2
    };
  });
  private readonly min = 0;
  private readonly max = 100;
  private readonly startAngle = 0;
  private readonly endAngle = 360;
  private readonly bufferSpace = 4;

  protected readonly internalSeries = computed(() => {
    const inputSeries = this.series();
    const result: InternalSeries[] = [];
    let nextPosAngle = 0;

    for (const series of inputSeries) {
      // Does not add series if percent is 0 or less
      if (series.valuePercent > 0) {
        const { nextAngle, internal } = this.toInternalSeries(nextPosAngle, series);
        result.push(internal);
        nextPosAngle = nextAngle;
      }
    }
    return result;
  });

  private toInternalSeries(
    startAngle: number,
    series: MicroDonutSeries,
    color?: string
  ): { nextAngle: number; internal: InternalSeries } {
    let nextAngle =
      valueToRelativeAngle(
        this.startAngle,
        this.endAngle,
        this.min,
        this.max,
        series.valuePercent
      ) + startAngle;

    startAngle = this.containAngle(startAngle);
    nextAngle = this.containAngle(nextAngle);

    color ??= series.colorToken;
    const internal: InternalSeries = {
      series,
      path: makeArc(this.center(), this.radius(), startAngle, nextAngle),
      colorVar: `var(--${color})`
    };
    return { nextAngle, internal };
  }

  private containAngle(angle: number): number {
    return Math.max(this.startAngle, Math.min(this.endAngle, angle));
  }
}
