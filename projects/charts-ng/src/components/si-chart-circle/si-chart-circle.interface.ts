/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { PieSeriesOption } from 'echarts';

export interface CircleChartData {
  value: number;
  name?: string;
  label?: {
    color?: string;
    [key: string]: any;
  };
  itemStyle?: {
    color?: string;
    [key: string]: any;
  };
}

export interface CircleChartSeries {
  name: string;
  radius?: string[]; // array length 2 e.g. [ '0%', '40%' ]
  data: CircleChartData[];
  /**
   * The start angle from which the circle should start, the range is [0, 360].
   * @defaultValue 90
   */
  startAngle?: number;
  /**
   * The end angle where the circle should end.
   *
   * @defaultValue 'auto' - In this case the end Angle is calculated
   * automatically based on startAngle to ensure it is a complete circle.
   */
  endAngle?: number;
  label?: {
    /**
     * A custom label formatter based on echarts, some commonly used variations can be
     * \{a\}: series name.
     * \{b\}: the name of a data item.
     * \{c\}: the value of a data item.
     * \{d\}: the percent.
     * See {@link https://echarts.apache.org/en/option.html#series-pie.label.formatter}
     */
    formatter?: NonNullable<PieSeriesOption['label']>['formatter'];
  };
}

export interface CircleValueUpdate {
  seriesIndex: number;
  valueIndex: number;
  value: number;
}
