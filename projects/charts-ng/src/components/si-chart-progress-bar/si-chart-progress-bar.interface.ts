/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
export interface ProgressBarChartSeries {
  name: string;
  percent: number;
}

export interface ProgressBarValueUpdate {
  valueIndex: number;
  value: number;
}
