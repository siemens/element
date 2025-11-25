/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import type {
  AxisPointerComponentOption,
  BarSeriesOption,
  BrushComponentOption,
  CandlestickSeriesOption,
  CustomSeriesOption,
  DatasetComponentOption,
  DataZoomComponentOption,
  GaugeSeriesOption,
  GridComponentOption,
  HeatmapSeriesOption,
  LegendComponentOption,
  LineSeriesOption,
  MarkAreaComponentOption,
  MarkLineComponentOption,
  MarkPointComponentOption,
  PieSeriesOption,
  PolarComponentOption,
  SankeySeriesOption,
  ScatterSeriesOption,
  SingleAxisComponentOption,
  SunburstSeriesOption,
  TitleComponentOption,
  ToolboxComponentOption,
  TooltipComponentOption,
  VisualMapComponentOption
} from 'echarts';

export type EChartSeriesOption =
  // series/chart types
  | BarSeriesOption
  | CandlestickSeriesOption
  | CustomSeriesOption
  | GaugeSeriesOption
  | HeatmapSeriesOption
  | LineSeriesOption
  | PieSeriesOption
  | ScatterSeriesOption
  | SankeySeriesOption
  | SunburstSeriesOption
  | never;

export type EChartSeries = EChartSeriesOption[];

export type {
  AxisPointerComponentOption,
  BrushComponentOption,
  DatasetComponentOption,
  DataZoomComponentOption,
  GridComponentOption,
  LegendComponentOption,
  MarkAreaComponentOption,
  MarkLineComponentOption,
  MarkPointComponentOption,
  PolarComponentOption,
  SingleAxisComponentOption,
  TitleComponentOption,
  ToolboxComponentOption,
  TooltipComponentOption,
  VisualMapComponentOption,
  BarSeriesOption,
  CandlestickSeriesOption,
  CustomSeriesOption,
  GaugeSeriesOption,
  HeatmapSeriesOption,
  LineSeriesOption,
  PieSeriesOption,
  ScatterSeriesOption,
  SankeySeriesOption,
  SunburstSeriesOption
};

// FIXME: this isn't typesafe, but echarts main type is incomplete and sometimes too strict
export interface EChartOption {
  legend?: LegendComponentOption[];
  dataZoom?: DataZoomComponentOption[];
  grid?: GridComponentOption | GridComponentOption[];
  series?: EChartSeries;
  [key: string]: any;
}
