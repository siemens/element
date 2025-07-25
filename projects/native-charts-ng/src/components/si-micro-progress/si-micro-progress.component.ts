/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface MicroProgressSeries {
  valuePercent: number;
  colorToken: string;
}

@Component({
  selector: 'si-micro-progress',
  templateUrl: './si-micro-progress.component.html',
  styleUrl: './si-micro-progress.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiMicroProgressComponent {
  readonly series = input<MicroProgressSeries>();

  /** @defaultValue 64 */
  readonly barWidth = input<number>(64);
  /** @defaultValue 4 */
  readonly barHeight = input<number>(4);

  protected labelHeight = 16;
}
