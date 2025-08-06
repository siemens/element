/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface MicroProgressSeries {
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
  selector: 'si-micro-progress',
  templateUrl: './si-micro-progress.component.html',
  styleUrl: './si-micro-progress.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiMicroProgressComponent {
  /**
   * Micro progress series.
   * Example series can be:
   * @example
   * ```ts
   * Series: MicroProgressSeries = { valuePercent: 80, colorToken: 'element-data-7' };
   * ```
   */
  readonly series = input.required<MicroProgressSeries>();
  /** @defaultValue 64 */
  readonly barWidth = input<number>(64);
  /** @defaultValue 4 */
  readonly barHeight = input<number>(4);
}
