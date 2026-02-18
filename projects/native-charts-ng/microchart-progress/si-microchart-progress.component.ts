/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface MicrochartProgressSeries {
  /** Value in percent */
  valuePercent: number;
  /**
   * Use a data-color. See: {@link https://element.siemens.io/fundamentals/colors/data-visualization-colors/#tokens}
   *
   * @example "element-data-10"
   */
  colorToken: string;
}

@Component({
  selector: 'si-microchart-progress',
  templateUrl: './si-microchart-progress.component.html',
  styleUrl: './si-microchart-progress.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiMicrochartProgressComponent {
  /**
   * Microchart progress series.
   * Example series can be:
   * @example
   * ```ts
   * Series: MicrochartProgressSeries = { valuePercent: 80, colorToken: 'element-data-7' };
   * ```
   */
  readonly series = input.required<MicrochartProgressSeries>();
  /** @defaultValue 64 */
  readonly barWidth = input<number>(64);
  /** @defaultValue 4 */
  readonly barHeight = input<number>(4);
}
