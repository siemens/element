/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import {
  BarSeriesOption,
  CandlestickSeriesOption,
  HeatmapSeriesOption,
  LineSeriesOption,
  MarkAreaComponentOption,
  MarkLineComponentOption,
  MarkPointComponentOption,
  ScatterSeriesOption
} from '../../shared/echarts.model';
import { SiSeriesOption } from '../si-chart/si-chart.interfaces';

export type LineStepType = 'start' | 'middle' | 'end';
export type LineType = 'solid' | 'dashed' | 'dotted';

export interface SubchartGrid {
  categoryId?: string;
  top?: number | string;
  bottom?: number | string;
  left?: number | string;
  right?: number | string;
  height?: number | string;
  containLabel?: boolean;
}

export interface SiLineSeriesOption extends LineSeriesOption, SiSeriesOption {
  area?: boolean;
}

export type SiBarSeriesOption = BarSeriesOption & SiSeriesOption;
export type SiHeatmapSeriesOption = HeatmapSeriesOption & SiSeriesOption;
export type SiScatterSeriesOption = ScatterSeriesOption & SiSeriesOption;
export type SiCandlestickSeriesOption = CandlestickSeriesOption & SiSeriesOption;

export type LineSeriesData = NonNullable<LineSeriesOption['data']>;
export type BarSeriesData = NonNullable<BarSeriesOption['data']>;
export type HeatmapSeriesData = NonNullable<HeatmapSeriesOption['data']>;
export type ScatterSeriesData = NonNullable<
  Exclude<ScatterSeriesOption['data'], ArrayLike<number>>
>;
export type CandlestickSeriesData = NonNullable<CandlestickSeriesOption['data']>;

export type CartesianDataNullable =
  | LineSeriesData
  | BarSeriesData
  | HeatmapSeriesData
  | ScatterSeriesData
  | CandlestickSeriesData
  | never;

export type CartesianChartData = NonNullable<CartesianDataNullable>;
export type CartesianChartSeries =
  | SiBarSeriesOption
  | SiLineSeriesOption
  | SiHeatmapSeriesOption
  | SiScatterSeriesOption
  | SiCandlestickSeriesOption
  | never;

export type MarkAreaData = NonNullable<MarkAreaComponentOption['data']>;
export type MarkPointData = NonNullable<MarkPointComponentOption['data']>;
export type MarkLineData = NonNullable<MarkLineComponentOption['data']>;
