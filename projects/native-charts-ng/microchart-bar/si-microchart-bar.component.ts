/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface MicrochartBarSeries {
  /* Series values */
  values: number[];
  /**
   * Use a data-color. See: {@link https://element.siemens.io/fundamentals/colors/data-visualization-colors/#tokens}
   *
   * @example "element-data-10"
   */
  colorToken: string;
  /**
   * Color token for negative values
   */
  negativeColorToken?: string;
}

interface SeriesInternal {
  top: number;
  height: number;
  colorToken: string;
}

@Component({
  selector: 'si-microchart-bar',
  templateUrl: './si-microchart-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiMicrochartBarComponent {
  /** @defaultValue 64 */
  readonly width = input<number>(64);
  /** @defaultValue 24 */
  readonly height = input<number>(24);
  /**
   * Microchart bar series.
   * Example series can be:
   * @example
   * ```ts
   * Series: MicrochartBarSeries = { values: [2, 4, 5, 3, 5, 7, 7, 9, 11, 10, 12, 9], colorToken: 'element-data-7'};
   * ```
   */
  readonly series = input.required<MicrochartBarSeries>();

  protected barWidth = 4;

  protected readonly internalSeries = computed<SeriesInternal[]>(() => {
    const series = this.series();
    const maxValue = Math.max(...series.values, 1);
    const minValue = Math.min(...series.values, 0);
    const allNegative = maxValue <= 0;
    const allPositive = minValue >= 0;
    const range = Math.abs(maxValue) + Math.abs(minValue);
    const zeroPosition = allNegative ? 0 : allPositive ? 100 : (Math.abs(maxValue) / range) * 100;

    const maxRange = allNegative ? Math.abs(minValue) : allPositive ? maxValue : range;

    const int = series.values.map<SeriesInternal>(value => {
      const height = (Math.abs(value) / maxRange) * 100;
      const top = value >= 0 ? zeroPosition - height : zeroPosition;
      const colorToken =
        value < 0 && series.negativeColorToken ? series.negativeColorToken : series.colorToken;
      return { top, height, colorToken };
    });

    return int;
  });
}
