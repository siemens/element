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

  protected readonly seriesData = computed(() => {
    const values = this.series().values;
    const maxValue = Math.max(...values, 1);
    const minValue = Math.min(...values, 0);
    const allNegative = maxValue <= 0;
    const allPositive = minValue >= 0;
    const range = Math.abs(maxValue) + Math.abs(minValue);
    const zeroPosition = allNegative ? 0 : allPositive ? 100 : (Math.abs(maxValue) / range) * 100;

    return {
      values,
      maxValue,
      minValue,
      allNegative,
      allPositive,
      range,
      zeroPosition
    };
  });

  protected getBarHeight(value: number): number {
    const data = this.seriesData();
    const maxRange = data.allNegative
      ? Math.abs(data.minValue)
      : data.allPositive
        ? data.maxValue
        : data.range;
    return (Math.abs(value) / maxRange) * 100;
  }

  protected getBarTop(value: number): number {
    const data = this.seriesData();
    if (data.allNegative) return 0;
    if (data.allPositive) return 100 - this.getBarHeight(value);

    // For mixed values
    if (value >= 0) {
      return data.zeroPosition - this.getBarHeight(value);
    } else {
      return data.zeroPosition;
    }
  }
}
