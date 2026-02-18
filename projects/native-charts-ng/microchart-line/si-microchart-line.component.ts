/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Coordinate, makePolyline } from '@siemens/native-charts-ng/utils';

export interface MicrochartLineSeries {
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
  selector: 'si-microchart-line',
  templateUrl: './si-microchart-line.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiMicrochartLineComponent {
  /**
   * Microchart line series.
   * Example series can be:
   * @example
   * ```ts
   * Series: MicrochartLineSeries = { values: [2, 3, 6, 5, 4, 7, 8], colorToken: 'element-data-10' };
   * ```
   */
  readonly series = input.required<MicrochartLineSeries>();
  /** @defaultValue 64 */
  readonly width = input<number>(64);
  /** @defaultValue 24 */
  readonly height = input<number>(24);
  /**
   * Display circular markers at each data point on the line.
   * When enabled, markers help highlight individual values and improve readability.
   *
   * @defaultValue false
   */
  readonly showMarkers = input<boolean>(false);
  /**
   * Sets whether the area under the chart line should be filled.
   *
   * @defaultValue false
   */
  readonly showArea = input<boolean>(false);
  /**
   * Line width in pixels.
   *
   * @defaultValue 2
   */
  readonly lineWidth = input<number>(2);
  /**
   * Marker color token. If not provided, uses the series color token.
   * Use a data-color. See: {@link https://element.siemens.io/fundamentals/colors/data-visualization-colors/#tokens}
   *
   * @example "element-data-2"
   */
  readonly markerColor = input<string>();

  protected readonly markerRadius = computed(() => this.lineWidth());
  protected readonly viewBox = computed(() => {
    return `0 0 ${this.width()} ${this.height()}`;
  });

  protected readonly path = computed(() => {
    const series = this.series();
    if (!series || series.values.length < 2) {
      return '';
    }
    const points = this.mapToCoordinates(series.values);
    return makePolyline(points);
  });

  protected readonly markerPoints = computed(() => {
    const series = this.series();
    if (series?.values.length === 0) {
      return [];
    }
    return this.mapToCoordinates(series.values);
  });

  protected readonly areaPath = computed(() => {
    const series = this.series();
    if (!series || series.values.length < 2) {
      return '';
    }
    const points = this.mapToCoordinates(series.values);

    let path = `M ${points[0].x} ${this.height()}`;
    points.forEach(point => {
      path += `L ${point.x} ${point.y}`;
    });
    path += `L ${points[points.length - 1].x} ${this.height()} Z`;

    return path;
  });

  private static instanceCounter = 0;
  protected readonly gradientId = `gradient-line-${SiMicrochartLineComponent.instanceCounter++}`;

  private mapToCoordinates(values: number[]): Coordinate[] {
    const max = Math.max(...values);
    const min = Math.min(...values);

    // Calculate available space, accounting for marker radius or line width
    // This helps avoid the markers on the edges or the edges of the line getting cropped.
    const horizontalMargin = this.showMarkers() ? this.markerRadius() : this.lineWidth() / 2;
    const verticalMargin = this.showMarkers() ? this.markerRadius() : this.lineWidth() / 2;

    const availableWidth = this.width() - horizontalMargin * 2;
    const availableHeight = this.height() - verticalMargin * 2;

    const scaleX = values.length > 1 ? availableWidth / (values.length - 1) : 0;
    const scaleY = max !== min ? availableHeight / (max - min) : 1;

    return values.map((value, i) => ({
      x: horizontalMargin + i * scaleX,
      y: this.height() - verticalMargin - (value - min) * scaleY
    }));
  }
}
