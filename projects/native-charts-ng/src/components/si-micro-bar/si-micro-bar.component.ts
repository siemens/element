/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, input, OnInit } from '@angular/core';

export interface MicroBarSeries {
  values: number[];
  colorToken: string;
}

@Component({
  selector: 'si-micro-bar',
  templateUrl: './si-micro-bar.component.html',
  styleUrl: './si-micro-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiMicroBarComponent implements OnInit {
  /** @defaultValue 64 */
  readonly width = input<number>(64);
  /** @defaultValue 16 */
  readonly height = input<number>(16);
  readonly series = input<MicroBarSeries>();

  protected barWidth = 4;
  protected maxValue = 1;
  protected padding = 8;

  ngOnInit(): void {
    const series = this.series();
    if (series?.values.length) {
      this.maxValue = Math.max(...series.values);
    }
  }
}
