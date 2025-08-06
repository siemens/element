/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Coordinate, makePolyline } from '@spike-rabbit/native-charts-ng/utils';

export interface MicroLineSeries {
  /** Series values */
  values: number[];
  /**
   * Use a data-color. See: {@link https://element.siemens.io/fundamentals/colors/data-visualization-colors/#tokens}
   *
   * @example "element-data-10"
   */
  colorToken: string;
}

@Component({
  selector: 'si-micro-line',
  templateUrl: './si-micro-line.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiMicroLineComponent {
  /**
   * Micro line series.
   * Example series can be:
   * @example
   * ```ts
   * Series: MicroLineSeries = { values: [2, 3, 6, 5, 4, 7, 8], colorToken: 'element-data-10' };
   * ```
   */
  readonly series = input.required<MicroLineSeries>();
  /** @defaultValue 64 */
  readonly width = input<number>(64);
  /** @defaultValue 24 */
  readonly height = input<number>(24);

  protected strokeWidth = 2;

  protected readonly path = computed(() => {
    const series = this.series();
    if (!series || series.values.length < 2) {
      return '';
    }
    const points = this.mapToCoordinates(series.values, this.width(), this.height());
    return makePolyline(points);
  });

  private mapToCoordinates(values: number[], width: number, height: number): Coordinate[] {
    const max = Math.max(...values);
    const min = Math.min(...values);
    const scaleX = width / (values.length - 1);
    const scaleY = max !== min ? height / (max - min) : 1;

    return values.map((value, i) => ({
      x: i * scaleX,
      y: height - (value - min) * scaleY
    }));
  }
}
