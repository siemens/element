/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, input, OnInit } from '@angular/core';

import { Coordinate, makeArc, valueToRelativeAngle } from '../../utils/svg-math';

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
export class SiMicroDonutComponent implements OnInit {
  /**
   * Series
   *
   * @defaultValue []
   */
  readonly series = input<MicroDonutSeries[]>([]);
  /**
   * Radius of donut
   *
   * @defaultValue 7.5
   */
  readonly radius = input(7.5);

  protected dim = { width: 100, height: 100 };
  protected backgroundPath = '';
  protected internalSeries!: InternalSeries[];
  protected arcThickness = 5;

  private center: Coordinate = { x: 50, y: 50 };
  private min = 0;
  private max = 100;
  private startAngle = 0;
  private endAngle = 360;
  private bufferSpace = 4;

  ngOnInit(): void {
    this.init();
    this.calc();
  }

  protected init(): void {
    this.arcThickness = 0.7 * this.radius();
    // Keeping the viewbox width and height only enough to fit the donut.
    // The radius is calculated from center of the donut to the mid point of the arc.
    // Hence half the arc thicknes on both side needs to be added (equals full arc thickness)
    // The buffer space is added because the svg donut gets cropped on certain Os + browser configuration.
    this.dim.width = this.dim.height = 2 * this.radius() + this.arcThickness + this.bufferSpace;

    // Once we have the viewbox dimensions, getting the donut at the center by
    // calculating correct coordinates
    this.center.x = this.center.y = this.dim.width / 2;
    this.backgroundPath = makeArc(this.center, this.radius(), this.startAngle, this.endAngle);
  }

  private calc(): void {
    this.internalSeries = [];
    let nextPosAngle = 0;
    for (const series of this.series()) {
      // Does not add series if percent is 0 or less
      if (series.valuePercent > 0) {
        nextPosAngle = this.addInternalSeries(nextPosAngle, series, undefined);
      }
    }
  }

  private addInternalSeries(startAngle: number, series: MicroDonutSeries, color?: string): number {
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

    this.pushInternalSeries(
      series,
      makeArc(this.center, this.radius(), startAngle, nextAngle),
      color
    );
    return nextAngle;
  }

  private containAngle(angle: number): number {
    return Math.max(this.startAngle, Math.min(this.endAngle, angle));
  }

  private pushInternalSeries(series: MicroDonutSeries, path: string, color?: string): void {
    color ??= series.colorToken;
    this.internalSeries.push({
      series,
      path,
      colorVar: `var(--${color})`
    });
  }
}
