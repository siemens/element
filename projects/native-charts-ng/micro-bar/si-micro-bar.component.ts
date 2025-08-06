/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface MicroBarSeries {
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
  selector: 'si-micro-bar',
  templateUrl: './si-micro-bar.component.html',
  styleUrl: './si-micro-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiMicroBarComponent {
  /** @defaultValue 64 */
  readonly width = input<number>(64);
  /** @defaultValue 16 */
  readonly height = input<number>(16);
  /**
   * Micro bar series.
   * Example series can be:
   * @example
   * ```ts
   * Series: MicroBarSeries = { values: [2, 4, 5, 3, 5, 7, 7, 9, 11, 10, 12, 9], colorToken: 'element-data-7'};
   * ```
   */
  readonly series = input.required<MicroBarSeries>();

  protected barWidth = 4;
  protected padding = 8;
  protected readonly maxValue = computed(() => {
    const currentSeries = this.series();
    return currentSeries?.values.length ? Math.max(...currentSeries.values) : 1;
  });
}
