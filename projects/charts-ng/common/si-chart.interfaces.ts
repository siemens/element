/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
/** */
export type AxisType = 'value' | 'category' | 'time' | 'log';
export type XAxisPosition = 'top' | 'bottom';
export type YAxisPosition = 'left' | 'right';
export type FilterMode = 'none' | 'filter' | 'weakFilter' | 'empty';

export type AxisData = (string | number | any)[];

interface ChartAxis {
  type: AxisType;
  offset?: number;
  name?: string;
  data?: AxisData;
  min?: number;
  max?: number;
  splitLine?: {
    show?: boolean;
  };
  axisLine?: {
    show?: boolean;
    onZero?: boolean;
  };
  splitNumber?: number;
  axisLabel?: any;
  show?: boolean;
  gridIndex?: number;
}

export interface ChartXAxis extends ChartAxis {
  position?: XAxisPosition;
  [key: string]: any;
}

export interface ChartYAxis extends ChartAxis {
  position?: YAxisPosition;
  scale?: boolean;

  [key: string]: any;
}

export interface SeriesUpdate<SeriesType> {
  index: number;
  data: SeriesType;
}

export interface AxisPointerEvent {
  seriesIndex?: number;
  dataIndex?: number;
}

export interface DataZoomRange {
  startValue?: number | string | Date;
  endValue?: number | string | Date;
  visibleWidth?: number; // Time in ms
  start?: number;
  end?: number;
}

export interface DataZoomEvent {
  rangeType: AxisType;
  rangeStart: number;
  rangeEnd: number;
  width?: number;
  autoZoomUpdate?: boolean;
  requested?: DataZoomRange;
  source?: string;
}

export interface LineColor {
  [key: string]: { color: string; index: number };
}

export interface SeriesSelectionState {
  [key: string]: boolean;
}

export interface SelectedLegendItem {
  legendItemName: string;
}

export interface LegendItem {
  itemName: string;
  dataIndex: number;
  selected?: boolean;
  color?: string;
}

export interface GridRectCoordinate {
  x: number;
  y: number;
  width: number;
  height: number;
  containerWidth: number;
  containerHeight: number;
}

export interface CustomLegendMultiLineInfo {
  customLegendId: number;
  isCustomLegendMultilined: boolean;
}

export interface SiSeriesOption {
  displayName?: string;
  customLegendToolTip?: string;
  visible?: boolean;
}

/**
 * @deprecated Use {@link SiSeriesOption} instead. The `Simpl` prefix is deprecated and will be removed in v51.
 */
export type { SiSeriesOption as SimplSeriesOption };
