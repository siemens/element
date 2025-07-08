/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { CartesianChartSeries, ChartXAxis, ChartYAxis } from '@siemens/charts-ng';

export interface ChartData {
  addSeries?: boolean;
  additionalOptions?: any;
  autoZoomSeriesIndex?: number;
  liveUpdate?: boolean;
  maxEntries?: number;
  progressIndication?: boolean;
  series: CartesianChartSeries[];
  showLegend: boolean;
  stacked?: boolean;
  title: string;
  tooltip?: any;
  zoomSlider?: boolean;
  zoomInside?: boolean;
  xAxis: ChartXAxis;
  yAxis: ChartYAxis | ChartYAxis[];
  visibleEntries?: number;
}

export class ChartBase {
  addSeries(): void {}
  changeData(): void {}
  startLive(): void {}
  stopLive(): void {}
  startProgressIndication(): void {}
  stopProgressIndication(): void {}
}
