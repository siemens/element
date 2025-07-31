/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, input, OnInit } from '@angular/core';

import { Coordinate, makePolyline } from '../../utils/svg-math';

export interface MicroLineSeries {
  values: number[];
  colorToken: string;
  id?: string;
}

@Component({
  selector: 'si-micro-line',
  templateUrl: './si-micro-line.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiMicroLineComponent implements OnInit {
  readonly series = input<MicroLineSeries>();
  /** @defaultValue 64 */
  readonly width = input<number>(64);
  /** @defaultValue 24 */
  readonly height = input<number>(24);

  protected path = '';
  protected strokeWidth = 2;

  ngOnInit(): void {
    this.updateChart();
  }

  private updateChart(): void {
    const series = this.series();

    if (!series || series.values.length < 2) {
      return;
    }

    const points = this.mapToCoordinates(series.values, this.width(), this.height());
    this.path = makePolyline(points);
  }

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
